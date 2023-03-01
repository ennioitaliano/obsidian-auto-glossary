import { App, DataAdapter, Notice, TFile } from "obsidian";

// enum to handle different cases
export enum fileType {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

// function to get the enum value from the string
export function getEnum(value: string): fileType {
	let result: fileType;

	switch (value.toLowerCase()) {
		case "glossary":
			result = fileType.g;
			break;
		case "index":
			result = fileType.i;
			break;
		case "glossaryindex":
			result = fileType.gi;
			break;
		default:
			result = fileType.gi;
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

export function sortFiles(notesTFile: TFile[], fileOrder: string) {
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

	return notesTFile;
}
