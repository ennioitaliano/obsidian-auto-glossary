import { Notice } from "obsidian";
import { cases, cleanFiles } from "./utils";
import { fileExists } from "./utils";

var fs = require("fs");

export async function getFiles(
	requestedFile: cases,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string
): Promise<string[]> {
	let notesTFile = global.app.vault.getMarkdownFiles();
	let notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(notesTFile);
	}

	notesTFile.forEach((file) => {
		if (chosenFolder && file.path.includes(chosenFolder)) {
			console.log(file.path);
			notes.push(file.path);
		} else if (!chosenFolder) {
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
		// ## to make them findable as sections
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
	chosenFolder?: string
) {
	let completeFileName = "";
	if (chosenFolder) {
		if (fileName) {
			completeFileName = chosenFolder + "/" + fileName;
		} else {
			completeFileName = chosenFolder + "/" + requestedFile;
		}
	} else {
		completeFileName = requestedFile;
	}

	if (fileName) {
		if (!fileExists(completeFileName)) {
			this.app.vault.create(
				completeFileName + ".md",
				await createText(
					requestedFile,
					fileInclusion,
					fileName,
					chosenFolder
				)
			);
			new Notice(`${completeFileName} file created`);
		} else {
			new Notice("Already existing file");
		}
	} else {
		console.log("requestedFile");
		if (!fileExists(requestedFile)) {
			this.app.vault.create(
				completeFileName + ".md",
				await createText(
					requestedFile,
					fileInclusion,
					completeFileName,
					chosenFolder
				)
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
	fileName?: string,
	chosenFolder?: string
): Promise<string> {
	let array = await getFiles(
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder
	);
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
