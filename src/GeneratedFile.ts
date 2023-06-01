import { MyFolder } from "MyFolder";
import {
	DataAdapter,
	Notice,
	TAbstractFile,
	TFile,
	TFolder,
	normalizePath,
} from "obsidian";
import { AutoGlossarySettings } from "settings";
import { NotesOrder } from "utils";

export class GeneratedFile {
	private name: string;
	private finalPath: string;
	private chosenFolder: TFolder;
	private includeFiles?: boolean;
	private overwrite?: boolean;
	private notesOrder?: NotesOrder;
	private destFolder?: TFolder;

	createText(
		filesAndFolders: TAbstractFile[],
		chosenFolderName: string,
		fileName?: string,
		isForGlossary?: boolean
	): Promise<string> {
		throw new Error("Method not implemented.");
	}

	constructor({
		name,
		chosenFolder,
		settings,
		includeFiles,
		overwrite,
		notesOrder,
		destFolder,
	}: {
		name: string;
		chosenFolder: TFolder;
		settings?: AutoGlossarySettings;
		includeFiles?: boolean;
		overwrite?: boolean;
		notesOrder?: NotesOrder;
		destFolder?: TFolder;
	}) {
		this.name = name;
		this.chosenFolder = chosenFolder;
		if (settings) {
			this.includeFiles = settings.includeFiles;
			this.overwrite = settings.fileOverwrite;
			this.notesOrder = settings.fileOrder;
			this.destFolder = settings.sameDest
				? chosenFolder
				: (app.vault.getAbstractFileByPath(
						settings.fileDest
					) as TFolder);
		} else {
			this.notesOrder = notesOrder;
			this.destFolder = destFolder;
			this.includeFiles = includeFiles;
			this.overwrite = overwrite;
		}

		this.FinalPath = name;
	}

	set FinalPath(fileName: string) {
		let path = "";

		if (this.destFolder) {
			path = this.destFolder.path;
		} else {
			path = this.chosenFolder.path;
		}

		//const fileName = fileName ?? typeof this;
		const normalizedPath = normalizePath(`${path}/${fileName}`);

		this.finalPath = normalizedPath + ".md";
	}

	get FinalPath(): string {
		return this.finalPath;
	}

	get ChosenFolder(): TFolder {
		return this.chosenFolder;
	}

	get NotesOrder(): NotesOrder | undefined {
		return this.notesOrder;
	}

	get IncludeFiles(): boolean | undefined {
		return this.includeFiles;
	}

	get Overwrite(): boolean | undefined {
		return this.overwrite;
	}

	get Name(): string {
		return this.name;
	}

	get DestFolder(): TFolder | undefined {
		return this.destFolder;
	}

	getFileName(): string {
		return this.finalPath.split("/").pop() ?? "";
	}

	async exists(): Promise<boolean> {
		const adapter: DataAdapter = app.vault.adapter;
		const result = await adapter.exists(this.finalPath);

		if (result) {
			console.log(`File ${this.finalPath} already exists`);
		}

		return result;
	}

	async writeFile() {
		const adapter: DataAdapter = app.vault.adapter;
		const frontmatter = `---\ntags: obsidian-auto-glossary\n---\n`;

		const fileExistsBool = await this.exists();

		if (fileExistsBool && !this.overwrite) {
			new Notice(
				`${this.FinalPath} file already exists. Try again with overwrite enabled or a different file name.`
			);
		} else {
			const filesAndFolders = await this.getFilesAndFolders(
				this.chosenFolder
			);

			const chosenFolderName = this.chosenFolder.name;

			const text = await this.createText(
				filesAndFolders,
				chosenFolderName,
				this.Name
			);

			const completeText = frontmatter + text;

			adapter.write(this.FinalPath, completeText);

			new Notice(
				fileExistsBool
					? `${this.FinalPath} updated`
					: `${this.FinalPath} created`
			);
		}
	}

	async getFilesAndFolders(
		startingFolder: TFolder,
		depth?: number
	): Promise<TAbstractFile[]> {
		const rootFolder: TFolder | null =
			startingFolder ?? app.vault.getRoot();

		let filesAndFoldersArray: TAbstractFile[] = [];
		const currentDepth = depth ?? 0;

		for (const child of rootFolder.children) {
			if (child instanceof TFile) {
				if (child.extension === "md") {
					const fileContent = await app.vault.cachedRead(child);
					if (
						!this.includeFiles &&
						!fileContent.contains(
							"---\ntags: obsidian-auto-glossary\n---\n"
						)
					) {
						filesAndFoldersArray.unshift(child);
					} else if (this.includeFiles) {
						filesAndFoldersArray.unshift(child);
					}
				}
			} else if (child instanceof TFolder) {
				const myFolder = new MyFolder(child, currentDepth);
				filesAndFoldersArray.push(myFolder);

				filesAndFoldersArray = await filesAndFoldersArray.concat(
					await this.getFilesAndFolders(child, currentDepth + 1)
				);
			}
		}

		return filesAndFoldersArray;
	}
}
