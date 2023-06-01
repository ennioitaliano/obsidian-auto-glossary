import { TAbstractFile, TFile, TFolder, Vault } from "obsidian";

export class MyFolder implements TFolder {
	name: string;
	path: string;
	children: TAbstractFile[];
	parent: TFolder;
	vault: Vault;
	depth: number;

	isRoot(): boolean {
		return TFolder.prototype.isRoot.call(this);
	}

	constructor(tFolder: TFolder, depth = 0) {
		this.name = tFolder.name;
		this.path = tFolder.path;
		this.children = tFolder.children;
		this.parent = tFolder.parent;
		this.vault = tFolder.vault;
		this.depth = depth;
	}

	async getChildren(
		includeFiles: boolean
	): Promise<TAbstractFile[]> {
		let filesAndFoldersArray: TAbstractFile[] = [];

		for (const child of this.children) {
			if (child instanceof TFile) {
				if (child.extension === "md") {
					const fileContent = await app.vault.cachedRead(child);
					if (
						!includeFiles &&
						!fileContent.contains(
							"---\ntags: obsidian-auto-glossary\n---\n"
						)
					) {
						filesAndFoldersArray.unshift(child);
					} else if (includeFiles) {
						filesAndFoldersArray.unshift(child);
					}
				}
			} else if (child instanceof TFolder) {
				const myChild = new MyFolder(child, this.depth + 1);
				filesAndFoldersArray.push(myChild);

				filesAndFoldersArray = await filesAndFoldersArray.concat(
					await myChild.getChildren(includeFiles)
				);
			}
		}

		return filesAndFoldersArray;
	}
}
