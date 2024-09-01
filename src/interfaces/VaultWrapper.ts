import { TFile } from "obsidian";

export interface VaultWrapper {
    cachedRead(file: TFile): Promise<string>;
}