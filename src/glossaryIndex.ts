import { App, DataAdapter, normalizePath, Notice } from "obsidian";
import {
	fileType,
	cleanFiles,
	fileExists,
	sortFiles,
	fileOrder,
	getEnumFO,
} from "./utils";
import chokidar from "chokidar";
import { EventName } from "chokidar/handler";
import { AutoGlossarySettings } from "settings";

/**
 * TODO: This whole function needs to be refactored, it does far too many things
 * 
 * This function:
 * 1) Searches for all notes
 * 2) Filters out plugin created notes based on fileInclusion param
 * 3) Sorts notes based on the fileOrder parameter
 * 4) Filters out all notes not in the chosen directory (skips this step if no directory is chosen)
 * 5) Loops through all remaining notes and creates all index and glossary strings for each note, appending them to their respected arrays
 * 6) Joins all index and glossary array strings into an index string and glossary string respectively (removing commas between them)
 * 7) Returns an array of strings where the first index is index string and the second index is the glossary string
 * 
 * @param app - The obsidian app object
 * @param requestedFile - 
 * @param fileInclusion - If true, plugin files will be included
 * @param fileName - The index/glossary filename
 * @param chosenFolder - The directory get the obsidian notes from
 * @param fileOrder - The ordering of the files in the index
 * @returns A list of strings filled with 
 */
export async function createArrays(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<Array<string>> {
	let notesTFile = app.vault.getMarkdownFiles();
	const notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app.vault, notesTFile);
	}

	if (fileOrder) {
		notesTFile = sortFiles(notesTFile, fileOrder);
	}

	notesTFile.forEach((file) => {
		if (
			(chosenFolder && file.path.includes(chosenFolder)) ||
			!chosenFolder
		) {
			notes.push(file.name);
		}
	});

	const glossaryArray: string[] = [];
	const indexArray: string[] = [];

	notes.forEach((note) => {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		const noteName = note.slice(0, -3);

		// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded
		if (requestedFile == fileType.gi) {
			indexArray.push(
				"- [[" + fileName + "#" + noteName + "|" + noteName + "]]\n"
			);
		} else {
			indexArray.push("- [[" + noteName + "]]\n");
		}

		// Array of strings that will show up as embedded notes
		// #### to make them findable as sections
		glossaryArray.push("#### ![[" + noteName + "]]\n\n***\n\n");
	});

	// Arrays toString + remove only the commas that separate the entries
	const indexText =
		"## Index\n" + indexArray.toString().replace(/,-\s\[\[/g, "- [[");
	const glossaryText =
		"## Glossary\n" +
		glossaryArray.toString().replace(/,####\s!\[\[/g, "#### ![[");
	return [indexText, glossaryText];
}

/**
 * Creates the filename
 * @param filename - the filename to create
 * @param requestedFile - the type of file to create
 * @param destFolder - Destination folder of the index/glossary
 * @param chosenFolder - Folder to create an index/glossary of
 * @returns A string representing the filename
 */
export function createFilename(filename: string, requestedFile: string, destFolder?: string, chosenFolder?: string): string {
	let completeFilename: string  = ""
	if (destFolder) {
		if (filename) {
			completeFilename = normalizePath(destFolder + "/" + filename);
		} else {
			completeFilename = normalizePath(destFolder + "/" + requestedFile);
		}
	} else if (chosenFolder) {
		if (filename) {
			completeFilename = normalizePath(chosenFolder + "/" + filename);
		} else {
			completeFilename = normalizePath(
				chosenFolder + "/" + requestedFile
			);
		}
	} else {
		completeFilename = normalizePath(requestedFile);
	}
	return completeFilename;
}

/**
 * Creates a file based on passed in options
 * @param app - The obsidian app
 * @param requestedFile - The type of file to create
 * @param fileInclusion - If true, it will include files created by the plugin (has plugin tag)
 * @param fileOverwrite - If true, will overwrite an existing file in a the specified directory
 * @param filename - The name of the file to create
 * @param chosenFolder - The folder chosen to get index/glossary contents from
 * @param fileOrder - If present, determines how to sort
 * @param destFolder - The destination folder for the index/glossary to live
 * @param triggerNotice - If true, will trigger an obsidian notice indicating the file has been updated
 */ 
export async function createFile(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	filename: string,
	chosenFolder?: string,
	fileOrder?: fileOrder,
	destFolder?: string,
	triggerNotice: boolean = true,
) {
	let completeFileName = createFilename(filename, requestedFile, destFolder, chosenFolder);

	const fileExistsBool = await fileExists(app.vault.adapter, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool && !fileOverwrite) {
		new Notice(`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createText(
				app,
				requestedFile,
				fileInclusion,
				filename,
				chosenFolder,
				fileOrder
			)
		);
		if (triggerNotice) {
			new Notice(`${completeFileName} file updated`);
		}
	}
}

/**
 * Creates text that will be used to write to the index/glossary files
 * @param app - The obsidian app object
 * @param requestedFile - The type of file to create
 * @param fileInclusion - If true, it will include files created by the plugin (has plugin tag)
 * @param filename - The name of the file to create
 * @param chosenFolder - The chosen folder to get the index/glossary contents from
 * @param fileOrder - If present, determines how to sort file entries in the index/glossary
 * @returns a string to write to the index/glossary file
 */
async function createText(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	filename?: string,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<string> {
	const array = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		filename,
		chosenFolder,
		fileOrder
	);
	let text = "---\ntags: obsidian-auto-glossary\n---\n";

	switch (requestedFile) {
		case fileType.g:
			text += array[1];
			break;
		case fileType.i:
			text += array[0];
			break;
		case fileType.gi:
			text += array[0] + "\n***\n\n" + array[1];
			break;
		default:
			break;
	}

	return text;
}

/**
 * Sets up a directory watcher
 * @param fullPath - The full watch path
 * @param relativeObsidianPath - The relative obsidian path 
 * @param indexFilename - The name of the index file to watch
 * @param settings - The auto glossary settings
 */
export function setupDirectoryWatcher(fullPath: string, relativeObsidianPath: string, indexFilename: string, settings: AutoGlossarySettings) {
	const directoryWatcher = chokidar.watch(fullPath).on("all", async (event: EventName, path: string) => {
		// TODO: use event enum
		if (event == "add" || event == "unlink" || event == "change") {
			// Indicates that the index file has been deleted
			if (path.contains(indexFilename) && event == "unlink") {
				// Unwatch the directory path
				directoryWatcher.unwatch(fullPath);

				// Index is being removed, so do not re-create it by updating it
				return;
			}

			createFile(
				this.app,
				fileType.i,
				settings.fileInclusion,
				true,
				indexFilename,
				relativeObsidianPath,
				getEnumFO(settings.fileOrder),
				settings.sameDest ? "" : settings.fileDest,
				false
			);
		}
	});
}