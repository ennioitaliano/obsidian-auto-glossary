import { DataAdapter, normalizePath, Notice, TFile } from "obsidian";
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

export async function fileExists(fileName: string): Promise<boolean> {
	//const notesTFiles = app.vault.getMarkdownFiles();
	let result: boolean;
	const adapter: DataAdapter = app.vault.adapter;

	//result = notesTFiles.some((file) => file.name.contains(fileName));
	console.log(fileName);
	result = await adapter.exists(fileName + ".md").then((value) => value);
	console.log(result);

	if (result) {
		new Notice("Already existing file " + fileName + ".md");
	}

	return result;
}

export async function cleanFiles(notesTFiles: TFile[]): Promise<TFile[]> {
	const { vault } = this.app;
	let cleanedNotes: TFile[] = [];

	notesTFiles.forEach(async (file: TFile) => {
		const fileContent = await vault.cachedRead(file);
		if (
			!fileContent
				.toString()
				.contains("---\ntags: obsidian-auto-glossary\n---\n")
		) {
			cleanedNotes.push(file);
		}
	});

	return cleanedNotes;
}
