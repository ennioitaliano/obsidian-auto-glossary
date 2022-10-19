import { Notice } from "obsidian";
import { cases } from "./utils";
import { fileExists } from "./utils";

var fs = require("fs");

export class GlossaryIndex {
	notes: string[] = [];
	indexText: string;
	glossaryText: string;

	constructor(requestedFile: cases) {
		const notesTFile = global.app.vault.getMarkdownFiles();

		for (let i = 0; i < notesTFile.length; i++) {
			//console.log(i + notesTFile[i].path);
			this.notes[i] = notesTFile[i].path;
		}

		const glossaryArray = [];
		const indexArray = [];

		for (let i = 0; i < this.notes.length; i++) {
			// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
			const noteName = this.notes[i].slice(0, -3);

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

		// Removing glossary and index note if already created

        //FIND A WAY TO LOOK INSIDE FILES FOR OAG TAG AND REMOVE THOSE FROM LIST
		indexArray.remove("- [[glossaryIndex#glossary|glossary]]\n");
		indexArray.remove("- [[glossaryIndex#index|index]]\n");
		indexArray.remove("- [[glossaryIndex#glossaryIndex|glossaryIndex]]\n");
		indexArray.remove("- [[glossary]]\n");
		indexArray.remove("- [[index]]\n");
		indexArray.remove("- [[glossaryIndex]]\n");
		glossaryArray.remove("## ![[glossary]]\n");
		glossaryArray.remove("## ![[index]]\n");
		glossaryArray.remove("## ![[glossaryIndex]]\n");

		// Arrays toString + remove all ','
		this.indexText = "# Index\n" + indexArray.toString().replace(/,/g, "");
		this.glossaryText =
			"# Glossary\n" + glossaryArray.toString().replace(/,/g, "");
	}
}

// This takes in which type of file we want to create and an optional fileName
export function createFile(requestedFile: cases, filename?: string) {
	if (filename) {
		if (!fileExists(filename)) {
			this.app.vault.create(filename + ".md", createText(requestedFile));
			new Notice(`${filename} file created`);
		} else {
			new Notice("Already existing file");
		}
	} else {
		console.log("requestedFile");
		if (!fileExists(requestedFile)) {
			this.app.vault.create(
				requestedFile + ".md",
				createText(requestedFile)
			);
			new Notice(`${requestedFile} file created`);
		} else {
			new Notice("Already existing file");
		}
	}
}

function createText(requestedFile: cases): string {
	const gloInd = new GlossaryIndex(requestedFile);
	let text = "---\ntags: oag\n---\n";

	switch (requestedFile) {
		case cases.g:
			text += gloInd.glossaryText;
			break;
		case cases.i:
			text += gloInd.indexText;
			break;
		case cases.gi:
			text += gloInd.indexText + "\n***\n\n" + gloInd.glossaryText;
			break;
		default:
			break;
	}

	return text;
}
