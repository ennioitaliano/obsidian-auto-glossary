import { TFile } from "obsidian";
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
	let notes: string[] = [];
	let result: boolean;

	for (let i = 0; i < notesTFiles.length; i++) {
		//console.log(i + notesTFile[i].path);
		notes[i] = notesTFiles[i].path;
	}

	if (notes.contains(fileName + ".md")) {
		result = true;
	} else {
		result = false;
	}

	return result;
}

export async function cleanFiles(notesTFiles: TFile[]): Promise<string[]> {
	const { vault } = this.app;
	let cleanedNotes: string[] = [];

	const fileContents: string[] = await Promise.all(
		vault.getMarkdownFiles().map((file: any) => vault.cachedRead(file))
	);

	let i = 0, y = 0;
	while (i < notesTFiles.length-1) {
		if (!fileContents[i].toString().contains("---\ntags: oag\n---\n")) {
			cleanedNotes[y] = notesTFiles[i].path;
			i++; y++
		} else {
			i++;
		}
		/*if (fileContents[i].toString().contains("---\ntags: oag\n---\n")) {
			console.log(notesTFiles[i].path);
		} else {
			cleanedNotes[i] = notesTFiles[i].path;
			i++;
		}*/
	}
	/*for (let i = 0; i < notesTFiles.length; i++) {
			if (!fileContents[i].toString().contains("---\ntags: oag\n---\n")) {
			}
			cleanedNotes[i] = notesTFiles[i].path;
		}*/

	return cleanedNotes;
}

/*export async function cleanFiles2(notesTFiles: TFile[]): Promise<string[]> {
	const fileContents: string[] = await Promise.all(
		this.app.vault.getMarkdownFiles().map((file: any) => {
			vault.cachedRead(file);
		})
	);

	let fileContents: string[] = [];
	let cleanedNotes: string[] = [];
    let prova : string = "";

	for (let i = 0; i < notesTFiles.length; i++) {
		fileContents = this.app.vault.cachedRead(notesTFiles[i]);
		if (!fileContents.toString().contains("---\ntags: oag\n---\n")) {
			cleanedNotes[i] = notesTFiles[i].path;
            prova=(fileContents.toString());

		}
	}

    console.log(prova);

	return cleanedNotes;
}*/
