import { VaultWrapper } from "./interfaces/VaultWrapper";
import { TFile } from "obsidian";

// enum to handle different cases
export enum fileType {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

// enum to handle different orders
export enum fileOrder {
	default = "default",
	mtime_new = "mtime_new",
	mtime_old = "mtime_old",
	ctime_new = "ctime_new",
	ctime_old = "ctime_old",
	alphabetical = "alphabetical",
	alphabetical_rev = "alphabetical_rev",
}

// function to get the file type enum key from the string
export function getEnumFT(value: string): fileType {
	if (!value) {
		return fileType.gi;
	}

	switch (value.toLowerCase()) {
		case "glossary":
			return fileType.g;
		case "index":
			return fileType.i;
		case "glossaryindex":
			return fileType.gi;
		default:
			return fileType.gi;
	}
}

// function to get the file order enum key from the string
export function getEnumFO(value: string): fileOrder {
	if (!value) {
		return fileOrder.default;
	}

	switch (value.toLowerCase()) {
		case "mtime_new":
			return fileOrder.mtime_new;
		case "mtime_old":
			return fileOrder.mtime_old;
		case "ctime_new":
			return fileOrder.ctime_new;
		case "ctime_old":
			return fileOrder.ctime_old;
		case "alphabetical":
			return fileOrder.alphabetical;
		case "alphabetical_rev":
			return fileOrder.alphabetical_rev;
		case "default":
		default:
			return fileOrder.default;
	}
}

export async function fileExists(
	vault: { getAbstractFileByPath: (path: string) => any },
	filePath: string
): Promise<boolean> {
	const normalized = filePath.endsWith(".md") ? filePath : `${filePath}.md`;
	return vault.getAbstractFileByPath(normalized) !== null;
}

export async function cleanFiles(
	vault: VaultWrapper,
	notesTFiles: TFile[]
): Promise<TFile[]> {
	const cleanedNotes: TFile[] = [];

	for (const file of notesTFiles) {
		try {
			const fileContent: string = await vault.cachedRead(file);
			if (!fileContent.includes("obsidian-auto-glossary")) {
				cleanedNotes.push(file);
			}
		} catch {
			// If reading fails for a file, keep it in the list
			cleanedNotes.push(file);
		}
	}

	return cleanedNotes;
}

export function sortFiles(notesTFile: TFile[], order: fileOrder): TFile[] {
	if (!notesTFile || !Array.isArray(notesTFile)) {
		throw new Error("Invalid file list provided to sortFiles");
	}

	switch (order) {
		case fileOrder.ctime_new:
			notesTFile.sort((a, b) => (b.stat?.ctime ?? 0) - (a.stat?.ctime ?? 0));
			break;
		case fileOrder.ctime_old:
			notesTFile.sort((a, b) => (a.stat?.ctime ?? 0) - (b.stat?.ctime ?? 0));
			break;
		case fileOrder.mtime_new:
			notesTFile.sort((a, b) => (b.stat?.mtime ?? 0) - (a.stat?.mtime ?? 0));
			break;
		case fileOrder.mtime_old:
			notesTFile.sort((a, b) => (a.stat?.mtime ?? 0) - (b.stat?.mtime ?? 0));
			break;
		case fileOrder.alphabetical:
			notesTFile.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
			break;
		case fileOrder.alphabetical_rev:
			notesTFile.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }));
			break;
		case fileOrder.default:
		default:
			break;
	}

	return notesTFile;
}
