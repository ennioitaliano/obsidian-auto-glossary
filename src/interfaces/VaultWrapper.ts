import { CachedMetadata, TAbstractFile, TFile, TFolder } from "obsidian";

export interface VaultWrapper {
	cachedRead(file: TFile): Promise<string>;
	getAbstractFileByPath(path: string): TAbstractFile | null;
	getRoot?(): TFolder;
	createFolder?(path: string): Promise<TFolder>;
	create?(path: string, data: string): Promise<TFile>;
	modify?(file: TFile, data: string): Promise<void>;
}

export interface MetadataCacheWrapper {
	getFileCache(file: TFile): CachedMetadata | null;
}