import { Notice } from "obsidian";
import { cases, cleanFiles } from "./utils";
import { fileExists } from "./utils";

var fs = require("fs");

export async function getFiles(requestedFile: cases): Promise<string[]> {
	const notesTFile = global.app.vault.getMarkdownFiles();

	const notes = await cleanFiles(notesTFile);

	const glossaryArray = [];
	const indexArray = [];

	for (let i = 0; i < notes.length; i++) {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		const noteName = notes[i].slice(0, -3);

		// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded
		if (requestedFile == cases.gi) {
			indexArray[i] =
				"- [[glossaryIndex#" + noteName + "|" + noteName + "]]\n";
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
export async function createFile(requestedFile: cases, filename?: string) {
	if (filename) {
		if (!fileExists(filename)) {
			this.app.vault.create(filename + ".md", await createText(requestedFile));
			new Notice(`${filename} file created`);
		} else {
			new Notice("Already existing file");
		}
	} else {
		console.log("requestedFile");
		if (!fileExists(requestedFile)) {
			this.app.vault.create(
				requestedFile + ".md",
				await createText(requestedFile)
			);
			new Notice(`${requestedFile} file created`);
		} else {
			new Notice("Already existing file");
		}
	}
}

async function createText(requestedFile: cases): Promise<string> {
	// This does not really modify myObj
	let array = await getFiles(requestedFile);
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
