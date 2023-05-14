import {
	App,
	DataAdapter,
	TAbstractFile,
	TFile,
	TFolder,
	Vault,
	normalizePath,
} from "obsidian";
import { type } from "os";

export type FileType = "index" | "glossary" | "glossaryindex";
export type NotesOrder =
	| "default"
	| "mtime_new"
	| "mtime_old"
	| "ctime_new"
	| "ctime_old"
	| "alphabetical"
	| "alphabetical_rev";

export async function getNotes({
	includeFiles,
	rootPath,
	notesOrder,
	prevResult,
}: {
	includeFiles: boolean;
	rootPath?: string;
	notesOrder?: NotesOrder;
	prevResult?: string[];
}): Promise<string[]> {
	console.log("rootPath: " + rootPath);

	const rootFolder: TFolder | null = app.vault.getAbstractFileByPath(
		rootPath ?? app.vault.getName()
	) as TFolder;

	/*const files: TFile[] = [];
	const folders: TFolder[] = [];*/

	let result: string[] = prevResult ?? [];

	//result.push(rootFolder.name);

	for (const child of rootFolder.children) {
		if (child instanceof TFile) {
			const fileContent = await app.vault.cachedRead(child);
			if (
				!includeFiles &&
				!fileContent.contains(
					"---\ntags: obsidian-auto-glossary\n---\n"
				)
			) {
				result.push(child.basename);
			}
		} else if (child instanceof TFolder) {
			result.push(child.name);

			result = result.concat(
				await getNotes({
					includeFiles,
					rootPath: child.path,
					notesOrder,
					//prevResult: result,
				})
			);
		}
	}

	/*console.log("RESULT: ");
	console.log(result);*/

	return result;
}

export async function fileExists(app: App, fileName: string): Promise<boolean> {
	const adapter: DataAdapter = app.vault.adapter;
	const result = await adapter.exists(fileName + ".md");

	if (result) {
		console.log(`File ${fileName}.md already exists`);
	}

	return result;
}

async function cleanFiles(absFiles: TAbstractFile[]): Promise<TAbstractFile[]> {
	const cleanedNotes: TAbstractFile[] = [];

	for (const file of absFiles) {
		if (file instanceof TFile) {
			const fileContent = await app.vault.cachedRead(file);
			if (
				!fileContent.contains(
					"---\ntags: obsidian-auto-glossary\n---\n"
				)
			) {
				cleanedNotes.push(file);
			}
		} else if (file instanceof TFolder) {
			cleanedNotes.push(file);
		}
	}

	return cleanedNotes;
}

function sortFiles(notesTFiles: TFile[], fileOrder: NotesOrder): TFile[] {
	const copy = [...notesTFiles];

	switch (fileOrder) {
		case "ctime_new":
			return copy.sort((a, b) => b.stat.ctime - a.stat.ctime);
		case "ctime_old":
			return copy.sort((a, b) => a.stat.ctime - b.stat.ctime);
		case "mtime_new":
			return copy.sort((a, b) => b.stat.mtime - a.stat.mtime);
		case "mtime_old":
			return copy.sort((a, b) => a.stat.mtime - b.stat.mtime);
		case "alphabetical":
			return copy.sort((a, b) => a.name.localeCompare(b.name));
		case "alphabetical_rev":
			return copy.sort((a, b) => b.name.localeCompare(a.name));
		case "default":
		default:
			return copy;
	}
}

export function fileNamer({
	fileType,
	fileName,
	chosenFolder,
	destFolder,
}: {
	fileType: FileType;
	fileName?: string;
	chosenFolder?: string;
	destFolder?: string;
}): string {
	let fullPath = "";

	if (destFolder) {
		fullPath = destFolder;
	} else if (chosenFolder) {
		fullPath = chosenFolder;
	}

	const name = fileName ?? fileType;
	const normalizedPath = normalizePath(`${fullPath}/${name}`);

	return normalizedPath;
}
