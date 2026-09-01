import { CachedMetadata, TAbstractFile, TFile, TFolder } from "obsidian";

export interface VaultWrapper {
	cachedRead(file: TFile): Promise<string>;
	getAbstractFileByPath(path: string): TAbstractFile | null;
	createFolder?(path: string): Promise<TFolder>;
	getFiles?(): TFile[];
	getMarkdownFiles?(): TFile[];
	getAllLoadedFiles?(): TAbstractFile[];
}

export interface MetadataCacheWrapper {
	getFileCache(file: TFile): CachedMetadata | null;
}