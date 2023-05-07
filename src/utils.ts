import { App, DataAdapter, TFile, normalizePath } from "obsidian";

export type FileType = "index" | "glossary" | "glossaryindex";
export type NotesOrder =
	| "default"
	| "mtime_new"
	| "mtime_old"
	| "ctime_new"
	| "ctime_old"
	| "alphabetical"
	| "alphabetical_rev";

export async function fileExists(app: App, fileName: string): Promise<boolean> {
	const adapter: DataAdapter = app.vault.adapter;
	const result = await adapter.exists(fileName + ".md");

	if (result) {
		console.log(`File ${fileName}.md already exists`);
	}

	return result;
}

async function cleanFiles(app: App, notesTFiles: TFile[]): Promise<TFile[]> {
	const { vault } = app;
	const cleanedNotes: TFile[] = [];

	for (const file of notesTFiles) {
		const fileContent = await vault.cachedRead(file);
		if (!fileContent.contains("---\ntags: obsidian-auto-glossary\n---\n")) {
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

export async function getNotes({
	app,
	includeFiles,
	chosenFolder,
	notesOrder,
}: {
	app: App;
	includeFiles: boolean;
	chosenFolder?: string;
	notesOrder?: NotesOrder;
}): Promise<string[]> {
	let notesTFiles = app.vault.getMarkdownFiles();

	if (!includeFiles) {
		notesTFiles = await cleanFiles(app, notesTFiles);
	}

	if (notesOrder) {
		notesTFiles = sortFiles(notesTFiles, notesOrder);
	}

	const notes = notesTFiles
		.filter((file) => !chosenFolder || file.path.includes(chosenFolder))
		.map((file) => file.name.slice(0, -3));

	return notes;
}
