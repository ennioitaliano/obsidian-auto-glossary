import { TAbstractFile, TFolder, Vault } from "obsidian";

export class MyFolder implements TFolder {
	name: string;
	path: string;
	children: TAbstractFile[];
	parent: TFolder;
	vault: Vault;
	depth?: number;

	isRoot(): boolean {
		throw new Error("Method not implemented.");
	}

	constructor(tFolder: TFolder, depth?: number) {
		this.name = tFolder.name;
		this.path = tFolder.path;
		this.children = tFolder.children;
		this.parent = tFolder.parent;
		this.vault = tFolder.vault;
		this.depth = depth;
	}
}
