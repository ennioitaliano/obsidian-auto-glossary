import { TAbstractFile, TFile, TFolder } from "obsidian";

export class VaultMock {
	/**
	 * Designed to be overwritten by Sinon mocks
	 */
	async cachedRead(file: TFile): Promise<string> {
		throw new Error("Not implemented");
	}

	getAbstractFileByPath(path: string): TAbstractFile | null {
		throw new Error("Not implemented");
	}

	async createFolder(path: string): Promise<TFolder> {
		throw new Error("Not implemented");
	}

	async create(path: string, data: string): Promise<TFile> {
		throw new Error("Not implemented");
	}

	async modify(file: TFile, data: string): Promise<void> {
		throw new Error("Not implemented");
	}

	getRoot(): TFolder {
		throw new Error("Not implemented");
	}
}