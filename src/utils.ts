import { TFile, TFolder } from "obsidian";

export type FileType = "index" | "glossary" | "glossaryindex";

export type NotesOrder =
	| "default"
	| "mtime_new"
	| "mtime_old"
	| "ctime_new"
	| "ctime_old"
	| "alphabetical"
	| "alphabetical_rev";

export type AbstractFile = { type: string; name: string; depth?: number };

export async function getFilesAndFolders({
	includeFiles,
	startingFolderPath,
	notesOrder,
	depth,
}: {
	includeFiles: boolean;
	startingFolderPath?: string;
	notesOrder?: NotesOrder;
	depth?: number;
}): Promise<AbstractFile[]> {
	const rootFolder: TFolder | null = startingFolderPath
		? (app.vault.getAbstractFileByPath(startingFolderPath) as TFolder)
		: app.vault.getRoot();

	let result: AbstractFile[] = [];
	const currentDepth = depth ?? 0;

	for (const child of rootFolder.children) {
		if (child instanceof TFile) {
			if (child.extension === "md") {
				const fileContent = await app.vault.cachedRead(child);
				if (
					!includeFiles &&
					!fileContent.contains(
						"---\ntags: obsidian-auto-glossary\n---\n"
					)
				) {
					result.unshift({ type: "file", name: child.basename });
				}
			}
		} else if (child instanceof TFolder) {
			//console.log("pushed: " + child.name + " depth: " + currentDepth);
			result.push({
				type: "folder",
				name: child.name,
				depth: currentDepth,
			});

			result = await result.concat(
				await getFilesAndFolders({
					includeFiles,
					startingFolderPath: child.path,
					notesOrder,
					depth: currentDepth + 1,
				})
			);
		}
	}

	return result;
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
