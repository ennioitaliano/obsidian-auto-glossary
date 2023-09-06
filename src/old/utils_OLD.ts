import { TFile } from "obsidian";

export type FileType = "index" | "glossary" | "glossaryindex";

export type NotesOrder =
	| "default"
	| "mtime_new"
	| "mtime_old"
	| "ctime_new"
	| "ctime_old"
	| "alphabetical"
	| "alphabetical_rev";

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
