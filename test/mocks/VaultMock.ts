import { TFile } from "obsidian";

export class VaultMock {
    /**
     * Designed to be overwritten by Sinon mocks
     */
    async cachedRead(file: TFile): Promise<string> {
        throw new Error("Not implemented");
    }
}