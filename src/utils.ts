/* c8 ignore next */
import { DataAdapterWrapper } from "interfaces/DataAdapterWrapper";
import { VaultWrapper } from "interfaces/VaultWrapper";
import { TFile } from "obsidian";
// TODO: Remove this after finding out how to remove imports from coverage

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

// function to get the file order enum key from the string
export function getEnumFO(value: string): fileOrder {
	let result: fileOrder;
	if (!value) {
		return fileOrder.default;
	} else {
		switch (value.toLowerCase()) {
			case "default":
				result = fileOrder.default;
				break;
			case "mtime_new":
				result = fileOrder.mtime_new;
				break;
			case "mtime_old":
				result = fileOrder.mtime_old;
				break;
			case "ctime_new":
				result = fileOrder.ctime_new;
				break;
			case "ctime_old":
				result = fileOrder.ctime_old;
				break;
			case "alphabetical":
				result = fileOrder.alphabetical;
				break;
			case "alphabetical_rev":
				result = fileOrder.alphabetical_rev;
				break;
			default:
				result = fileOrder.default;
				break;
		}
	}

	return result;
}

export async function fileExists(adapter: DataAdapterWrapper, fileName: string): Promise<boolean> {
	const result = await adapter.exists(fileName + ".md");

	if (result) {
		console.log("Already existing file " + fileName + ".md");
	}

	return result;
}

export async function cleanFiles(
	vault: VaultWrapper,
	notesTFiles: TFile[]
): Promise<TFile[]> {
	const cleanedNotes: TFile[] = [];

	notesTFiles.forEach(async (file: TFile) => {
		const fileContent: string = await vault.cachedRead(file);
		if (!fileContent.includes("---\ntags: obsidian-auto-glossary\n---\n")) {
			cleanedNotes.push(file);
		}
	});

	return cleanedNotes;
}

/* c8 ignore next */
export function sortFiles(notesTFile: TFile[], fileOrder: fileOrder) {
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
