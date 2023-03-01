import { App, DataAdapter, Notice, TFile } from "obsidian";

// enum to handle different cases
export enum cases {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

// function to get the enum value from the string
export function getEnum(value: string): cases {
	let result: cases;

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
			result = cases.gi;
			break;
	}

	return result;
}

export async function fileExists(app: App, fileName: string): Promise<boolean> {
	const adapter: DataAdapter = app.vault.adapter;
	const result = await adapter.exists(fileName + ".md");

	if (result) {
		new Notice("Already existing file " + fileName + ".md");
	}

	return result;
}

export async function cleanFiles(
	app: App,
	notesTFiles: TFile[]
): Promise<TFile[]> {
	const { vault } = app;
	const cleanedNotes: TFile[] = [];

	notesTFiles.forEach(async (file: TFile) => {
		const fileContent = await vault.cachedRead(file);
		if (!fileContent.contains("---\ntags: obsidian-auto-glossary\n---\n")) {
			cleanedNotes.push(file);
		}
	});

	return cleanedNotes;
}
