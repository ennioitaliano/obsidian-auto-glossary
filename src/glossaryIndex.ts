import { App, normalizePath, Notice } from "obsidian";
import { fileType, cleanFiles, fileExists, sortFiles } from "./utils";

export async function getFiles(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string
): Promise<string[]> {
	let notesTFile = app.vault.getMarkdownFiles();
	const notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app, notesTFile);
	}

	if(fileOrder) {
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

	// Arrays toString + remove all ','
	const indexText = "## Index\n" + indexArray.toString().replace(/,/g, "");
	const glossaryText =
		"## Glossary\n" + glossaryArray.toString().replace(/,/g, "");

	return [indexText, glossaryText];
}

// This takes in which type of file we want to create and an optional fileName
export async function createFile(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: string,
	destFolder?: string
) {
	let completeFileName = "";

	if (destFolder) {
		if (fileName) {
			completeFileName = normalizePath(destFolder + "/" + fileName);
		} else {
			completeFileName = normalizePath(destFolder + "/" + requestedFile);
		}
	} else if (chosenFolder) {
		if (fileName) {
			completeFileName = normalizePath(chosenFolder + "/" + fileName);
		} else {
			completeFileName = normalizePath(
				chosenFolder + "/" + requestedFile
			);
		}
	} else {
		completeFileName = normalizePath(requestedFile);
	}

	const fileExistsBool = await fileExists(app, completeFileName);

	if (!fileExistsBool) {
		app.vault.create(
			completeFileName + ".md",
			await createText(
				app,
				requestedFile,
				fileInclusion,
				fileName,
				chosenFolder,
				fileOrder
			)
		);
		new Notice(`${completeFileName} file created`);
	}
}

async function createText(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string
): Promise<string> {
	const array = await getFiles(
		app,
		requestedFile,
		fileInclusion,
		fileName,
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
