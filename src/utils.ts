import { MetadataCacheWrapper, VaultWrapper } from "./interfaces/VaultWrapper";
import { normalizePath, TAbstractFile, TFile, TFolder } from "obsidian";

// Standard PascalCase enums with lowercase compatibility
export enum FileType {
	Index = "index",
	Glossary = "glossary",
	GlossaryIndex = "glossaryIndex",
}

export const fileType = {
	i: FileType.Index,
	g: FileType.Glossary,
	gi: FileType.GlossaryIndex,
} as const;
export type fileType = FileType;

export enum FileOrder {
	Default = "default",
	MtimeNew = "mtime_new",
	MtimeOld = "mtime_old",
	CtimeNew = "ctime_new",
	CtimeOld = "ctime_old",
	Alphabetical = "alphabetical",
	AlphabeticalRev = "alphabetical_rev",
}

export const fileOrder = {
	default: FileOrder.Default,
	mtime_new: FileOrder.MtimeNew,
	mtime_old: FileOrder.MtimeOld,
	ctime_new: FileOrder.CtimeNew,
	ctime_old: FileOrder.CtimeOld,
	alphabetical: FileOrder.Alphabetical,
	alphabetical_rev: FileOrder.AlphabeticalRev,
} as const;
export type fileOrder = FileOrder;

// Function to get the file type enum key from the string
export function getEnumFT(value?: string): FileType {
	if (!value) {
		return FileType.GlossaryIndex;
	}

	switch (value.toLowerCase()) {
		case "glossary":
			return FileType.Glossary;
		case "index":
			return FileType.Index;
		case "glossaryindex":
			return FileType.GlossaryIndex;
		default:
			return FileType.GlossaryIndex;
	}
}

// Function to get the file order enum key from the string
export function getEnumFO(value?: string): FileOrder {
	if (!value) {
		return FileOrder.Default;
	}

	switch (value.toLowerCase()) {
		case "mtime_new":
			return FileOrder.MtimeNew;
		case "mtime_old":
			return FileOrder.MtimeOld;
		case "ctime_new":
			return FileOrder.CtimeNew;
		case "ctime_old":
			return FileOrder.CtimeOld;
		case "alphabetical":
			return FileOrder.Alphabetical;
		case "alphabetical_rev":
			return FileOrder.AlphabeticalRev;
		case "default":
		default:
			return FileOrder.Default;
	}
}

// Function to format filenames based on a user-defined pattern
export function formatFileName(
	pattern: string | undefined,
	folderName: string,
	defaultFallback: string
): string {
	if (!pattern || pattern.trim() === "") {
		return defaultFallback;
	}

	const safeFolder = folderName.trim() || "Vault";
	return pattern
		.replace(/\{\{folder\}\}/gi, safeFolder)
		.replace(/\{\{name\}\}/gi, safeFolder)
		.trim();
}

export async function fileExists(
	vault: { getAbstractFileByPath: (path: string) => TAbstractFile | null },
	filePath: string
): Promise<boolean> {
	const normalized = filePath.endsWith(".md") ? filePath : `${filePath}.md`;
	return vault.getAbstractFileByPath(normalized) !== null;
}

export async function cleanFiles(
	vault: VaultWrapper,
	notesTFiles: TFile[],
	metadataCache?: MetadataCacheWrapper
): Promise<TFile[]> {
	const cleanedNotes: TFile[] = [];

	for (const file of notesTFiles) {
		try {
			if (metadataCache) {
				const cache = metadataCache.getFileCache(file);
				if (cache?.frontmatter) {
					const tags = cache.frontmatter.tags || cache.frontmatter.tag;
					if (
						(typeof tags === "string" && tags.includes("obsidian-auto-glossary")) ||
						(Array.isArray(tags) && tags.includes("obsidian-auto-glossary"))
					) {
						continue;
					}
				}
			}

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

export function sortFiles(notesTFile: TFile[], order: FileOrder | string): TFile[] {
	if (!notesTFile || !Array.isArray(notesTFile)) {
		throw new Error("Invalid file list provided to sortFiles");
	}

	switch (order) {
		case FileOrder.CtimeNew:
			notesTFile.sort((a, b) => (b.stat?.ctime ?? 0) - (a.stat?.ctime ?? 0));
			break;
		case FileOrder.CtimeOld:
			notesTFile.sort((a, b) => (a.stat?.ctime ?? 0) - (b.stat?.ctime ?? 0));
			break;
		case FileOrder.MtimeNew:
			notesTFile.sort((a, b) => (b.stat?.mtime ?? 0) - (a.stat?.mtime ?? 0));
			break;
		case FileOrder.MtimeOld:
			notesTFile.sort((a, b) => (a.stat?.mtime ?? 0) - (b.stat?.mtime ?? 0));
			break;
		case FileOrder.Alphabetical:
			notesTFile.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
			break;
		case FileOrder.AlphabeticalRev:
			notesTFile.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base", numeric: true }));
			break;
		case FileOrder.Default:
		default:
			break;
	}

	return notesTFile;
}

export async function ensureFolderExists(
	vault: { getAbstractFileByPath: (path: string) => TAbstractFile | null; createFolder: (path: string) => Promise<TFolder> },
	folderPath: string
): Promise<void> {
	const normalized = normalizePath(folderPath).trim();
	if (!normalized || normalized === "/" || normalized === ".") {
		return;
	}

	const parts = normalized.split("/").filter((part) => part.length > 0);
	let currentPath = "";

	for (const part of parts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part;
		const existing = vault.getAbstractFileByPath(currentPath);
		if (!existing) {
			try {
				await vault.createFolder(currentPath);
			} catch (error) {
				if (!vault.getAbstractFileByPath(currentPath)) {
					throw error;
				}
			}
		}
	}
}

