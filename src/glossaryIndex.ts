import { App, normalizePath, Notice } from "obsidian";
import { cases, cleanFiles } from "./utils";
import { fileExists } from "./utils";

export async function getFiles(
	app: App,
	requestedFile: cases,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string
): Promise<string[]> {
	let notesTFile = app.vault.getMarkdownFiles();
	let notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app, notesTFile);
	}

	switch (fileOrder) {
		case "ctime_new":
			notesTFile.sort((a, b) => b.stat.ctime - a.stat.ctime);
			break;
		case "ctime_old":
			notesTFile.sort((a, b) => a.stat.ctime - b.stat.ctime);
			break;
		case "mtime_new":
			notesTFile.sort((a, b) => b.stat.mtime - a.stat.mtime);
			break;
		case "mtime_old":
			notesTFile.sort((a, b) => a.stat.mtime - b.stat.mtime);
			break;
		case "alphabetical":
			notesTFile.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // ignore upper and lowercase
				const nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			});
			break;
		case "alphabetical_rev":
			notesTFile.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // ignore upper and lowercase
				const nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA > nameB) {
					return -1;
				}
				if (nameA < nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			});
			break;
		case "default":
		default:
			break;
	}

	notesTFile.forEach((file) => {
		if (chosenFolder && file.path.includes(chosenFolder)) {
			/*if (file.path.replace(chosenFolder + "/", "").includes("/")) {
				file.path.replace(chosenFolder + "/", "").indexOf("/");
				console.log(file.path.replace(chosenFolder + "/", ""));
			}*/

			notes.push(file.name);
		} else if (!chosenFolder) {
			notes.push(file.name);
		}
	});

	const glossaryArray: string[] = [];
	const indexArray: string[] = [];

	notes.forEach((note) => {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		const noteName = note.slice(0, -3);

		// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded
		if (requestedFile == cases.gi) {
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
	requestedFile: cases,
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
	requestedFile: cases,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string
): Promise<string> {
	let array = await getFiles(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		fileOrder
	);
	let text = "---\ntags: obsidian-auto-glossary\n---\n";

	switch (requestedFile) {
		case cases.g:
			text += array[1];
			break;
		case cases.i:
			text += array[0];
			break;
		case cases.gi:
			text += array[0] + "\n***\n\n" + array[1];
			break;
		default:
			break;
	}

	return text;
}
