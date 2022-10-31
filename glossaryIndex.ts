import { Notice } from "obsidian";
import { cases, cleanFiles } from "./utils";
import { fileExists } from "./utils";

var fs = require("fs");

export async function getFiles(
	requestedFile: cases,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder: string
): Promise<string[]> {
	let notesTFile = global.app.vault.getMarkdownFiles();
	let notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(notesTFile);
	}

	notesTFile.forEach((file) => {
		if(file.path.includes(chosenFolder)) {
			console.log(file.path);
			notes.push(file.path);
		}
	});

	const glossaryArray = [];
	const indexArray = [];

	for (let i = 0; i < notes.length; i++) {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		const noteName = notes[i].slice(0, -3);

		// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded
		if (requestedFile == cases.gi) {
			indexArray[i] =
				"- [[" + fileName + "#" + noteName + "|" + noteName + "]]\n";
		} else {
			indexArray[i] = "- [[" + noteName + "]]\n";
		}

		// Array of strings that will show up as embedded notes
		glossaryArray[i] = "## ![[" + noteName + "]]\n";
	}

	// Arrays toString + remove all ','
	const indexText = "# Index\n" + indexArray.toString().replace(/,/g, "");
	const glossaryText =
		"# Glossary\n" + glossaryArray.toString().replace(/,/g, "");

	return [indexText, glossaryText];
}

// This takes in which type of file we want to create and an optional fileName
export async function createFile(
	requestedFile: cases,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder: string
) {
	if (fileName) {
		if (!fileExists(fileName)) {
			this.app.vault.create(
				fileName + ".md",
				await createText(requestedFile, fileInclusion, fileName, chosenFolder)
			);
			new Notice(`${fileName} file created`);
		} else {
			new Notice("Already existing file");
		}
	} else {
		console.log("requestedFile");
		if (!fileExists(requestedFile)) {
			fileName = requestedFile;
			this.app.vault.create(
				fileName + ".md",
				await createText(requestedFile, fileInclusion, fileName, chosenFolder)
			);
			new Notice(`${requestedFile} file created`);
		} else {
			new Notice("Already existing file");
		}
	}
}

async function createText(
	requestedFile: cases,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder: string
): Promise<string> {
	// This does not really modify myObj
	let array = await getFiles(requestedFile, fileInclusion, fileName, chosenFolder);
	let text = "---\ntags: oag\n---\n";

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
