import { CachedMetadata, TAbstractFile, TFile, TFolder } from "obsidian";

export interface VaultWrapper {
	cachedRead(file: TFile): Promise<string>;
	getAbstractFileByPath(path: string): TAbstractFile | null;
	createFolder?(path: string): Promise<TFolder>;
}

export interface MetadataCacheWrapper {
	getFileCache(file: TFile): CachedMetadata | null;
}