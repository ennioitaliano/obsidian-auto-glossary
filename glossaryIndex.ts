import { Notice } from "obsidian";
import { cases, cleanFiles } from "./utils";
import { fileExists } from "./utils";

var fs = require("fs");

export async function getFiles(
	requestedFile: cases,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string,
	destFolder?: string
): Promise<string[]> {
	let notesTFile = global.app.vault.getMarkdownFiles();
	let notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(notesTFile);
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
		//console.log(file.stat.ctime);

		if (chosenFolder && file.path.includes(chosenFolder)) {
			//console.log(file.path);
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
	requestedFile: cases,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: string,
	destFolder?: string
) {
	let completeFileName = "";
	console.log(destFolder);

	if (destFolder) {
		if (fileName) {
			completeFileName = destFolder + "/" + fileName;
		} else {
			completeFileName = destFolder + "/" + requestedFile;
		}
	} else if (chosenFolder) {
		if (fileName) {
			completeFileName = chosenFolder + "/" + fileName;
		} else {
			completeFileName = chosenFolder + "/" + requestedFile;
		}
	} else {
		completeFileName = requestedFile;
	}

	if (!fileExists(completeFileName)) {
		this.app.vault.create(
			completeFileName + ".md",
			await createText(
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
	requestedFile: cases,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: string
): Promise<string> {
	let array = await getFiles(
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
