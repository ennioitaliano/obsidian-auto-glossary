import { Notice, TFile } from "obsidian";
import { cachedDataVersionTag } from "v8";

export enum cases {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

export function getEnum(value: string): cases {
	let result: cases = cases.gi;

	switch (value.toLowerCase()) {
		case "glossary":
			result = cases.g;
			break;
		case "index":
			result = cases.i;
			break;
		case "glossaryindex":
			result = cases.gi;
			break;
		default:
			break;
	}

	return result;
}

export function fileExists(fileName: string): boolean {
	const notesTFiles = global.app.vault.getMarkdownFiles();
	let result: boolean;

	/*let notes: string[] = [];

	for (let i = 0; i < notesTFiles.length; i++) {
		//console.log(i + notesTFile[i].path);
		notes[i] = notesTFiles[i].path;
	}

	if (notes.contains(fileName + ".md")) {
		result = true;
	} else {
		result = false;
	}*/

	result = notesTFiles.some((file) => file.name.contains(fileName));

	if (result) {
		new Notice("Already existing file" + fileName + ".md");
	}

	return result;
}

export async function cleanFiles(notesTFiles: TFile[]): Promise<TFile[]> {
	const { vault } = this.app;
	let cleanedNotes: TFile[] = [];

	/*const fileContents: string[] = await Promise.all(
		vault.getMarkdownFiles().map((file: any) => vault.cachedRead(file))
	);

	let i = 0,
		y = 0;
	while (i < notesTFiles.length - 1) {
		if (
			!fileContents[i]
				.toString()
				.contains("---\ntags: obsidian-auto-glossary\n---\n")
		) {
			cleanedNotes[y] = notesTFiles[i];
			i++;
			y++;
		} else {
			i++;
		}
	} */

	vault.getMarkdownFiles().forEach((file: TFile) => {
		const fileContents = vault.cachedRead(file);
		if (
			!fileContents.toString().contains("---\ntags: obsidian-auto-glossary\n---\n")
		) {
			cleanedNotes.push(file);
			console.log("FILE PULITO" + file.name);
		} else {
			console.log(file.name);
		}
	});

	return cleanedNotes;
}
