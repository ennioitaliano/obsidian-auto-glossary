import { MyFolder } from "MyFolder";
import {
	DataAdapter,
	Notice,
	TAbstractFile,
	TFile,
	TFolder,
	normalizePath,
} from "obsidian";
import { NotesOrder } from "utils";

export class GeneratedFile {
	private completePath: string;
	private includeFiles: boolean;
	private overwrite: boolean;
	private chosenFolder?: string;
	private notesOrder?: NotesOrder;
	private destFolder?: string;

	createText(
		filesAndFolders: TAbstractFile[],
		chosenFolderName: string,
		fileName?: string,
		isForGlossary?: boolean
	): Promise<string> {
		throw new Error("Method not implemented.");
	}

	constructor(
		fileName: string,
		includeFiles: boolean,
		overwrite: boolean,
		chosenFolder?: string,
		notesOrder?: NotesOrder,
		destFolder?: string
	) {
		this.chosenFolder =
			chosenFolder === app.vault.getName()
				? (chosenFolder = "")
				: chosenFolder;
		this.notesOrder = notesOrder;
		this.destFolder = destFolder;
		this.CompletePath = fileName;
		this.includeFiles = includeFiles;
		this.overwrite = overwrite;
	}

	set CompletePath(name: string) {
		let completePath = "";

		if (this.destFolder) {
			completePath = this.destFolder;
		} else if (this.chosenFolder) {
			completePath = this.chosenFolder;
		}

		const fileName = name ?? typeof this;
		const normalizedPath = normalizePath(`${completePath}/${fileName}`);

		this.completePath = normalizedPath + ".md";
	}

	get CompletePath(): string {
		return this.completePath;
	}

	get ChosenFolder(): string | undefined {
		return this.chosenFolder;
	}

	get NotesOrder(): NotesOrder | undefined {
		return this.notesOrder;
	}

	get IncludeFiles(): boolean {
		return this.includeFiles;
	}

	get Overwrite(): boolean {
		return this.overwrite;
	}

	getFileName(): string {
		return this.completePath.split("/").pop() ?? "";
	}

	async exists(): Promise<boolean> {
		const adapter: DataAdapter = app.vault.adapter;
		const result = await adapter.exists(this.completePath);

		if (result) {
			console.log(`File ${this.completePath} already exists`);
		}

		return result;
	}

	async writeFile() {
		const adapter: DataAdapter = app.vault.adapter;
		const frontmatter = `---\ntags: obsidian-auto-glossary\n---\n`;

		const fileExistsBool = await this.exists();

		if (fileExistsBool && !this.overwrite) {
			new Notice(
				`${this.CompletePath} file already exists. Try again with overwrite enabled or a different file name.`
			);
		} else {
			const filesAndFolders = await this.getFilesAndFolders(
				this.ChosenFolder
			);

			const chosenFolderName =
				this.ChosenFolder?.split("/").pop() ?? app.vault.getName();

			const text = await this.createText(
				filesAndFolders,
				chosenFolderName,
				this.getFileName()
			);

			const completeText = frontmatter + text;

			adapter.write(this.CompletePath, completeText);

			new Notice(
				fileExistsBool
					? `${this.CompletePath} updated`
					: `${this.CompletePath} created`
			);
		}
	}

	async getFilesAndFolders(
		startingFolderPath?: string,
		depth?: number
	): Promise<TAbstractFile[]> {
		const rootFolder: TFolder | null = startingFolderPath
			? (app.vault.getAbstractFileByPath(startingFolderPath) as TFolder)
			: app.vault.getRoot();

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
					await this.getFilesAndFolders(child.path, currentDepth + 1)
				);
			}
		}

		return filesAndFoldersArray;
	}
}
