import { MyFolder, AutoGlossarySettings, NotesOrder } from "./modules";
import {
	DataAdapter,
	Notice,
	TAbstractFile,
	TFolder,
	normalizePath,
} from "obsidian";

export class GeneratedFile {
	private name: string;
	private chosenFolder: MyFolder;
	private includeFiles: boolean;
	private overwrite: boolean;
	private notesOrder: NotesOrder;
	private destFolder?: TFolder;

	createText(
		filesAndFolders: TAbstractFile[],
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
		chosenFolder: MyFolder;
		settings?: AutoGlossarySettings;
		includeFiles?: boolean;
		overwrite?: boolean;
		notesOrder?: NotesOrder;
		destFolder?: TFolder;
	}) {
		this.name = name;
		this.chosenFolder = chosenFolder;

		console.log(this.chosenFolder instanceof MyFolder);

		if (settings) {
			this.includeFiles = settings.includeFiles;
			this.overwrite = settings.fileOverwrite;
			this.notesOrder = settings.fileOrder;
			this.destFolder = settings.sameDest
				? chosenFolder
				: (app.vault.getAbstractFileByPath(
						settings.fileDest
				) as TFolder);
		} else if (includeFiles && overwrite && notesOrder && destFolder) {
			this.includeFiles = includeFiles;
			this.overwrite = overwrite;
			this.notesOrder = notesOrder;
			this.destFolder = destFolder;
		}
	}

	get ChosenFolder(): MyFolder {
		return this.chosenFolder;
	}

	set NotesOrder(notesOrder: NotesOrder) {
		this.notesOrder = notesOrder;
	}

	get NotesOrder(): NotesOrder {
		return this.notesOrder;
	}

	set IncludeFiles(includeFiles: boolean) {
		this.includeFiles = includeFiles;
	}

	get IncludeFiles(): boolean {
		return this.includeFiles;
	}

	set Overwrite(overwrite: boolean) {
		this.overwrite = overwrite;
	}

	get Overwrite(): boolean {
		return this.overwrite;
	}

	set Name(name: string) {
		this.name = name;
	}

	get Name(): string {
		return this.name;
	}

	set DestFolder(destFolder: TFolder | undefined) {
		this.destFolder = destFolder;
	}

	get DestFolder(): TFolder | undefined {
		return this.destFolder;
	}

	async exists(): Promise<boolean> {
		const adapter: DataAdapter = app.vault.adapter;
		const finalPath = this.getFinalPath();
		const result = await adapter.exists(finalPath);

		if (result) {
			console.log(`File ${finalPath} already exists`);
		}

		return result;
	}

	async writeFile() {
		const adapter: DataAdapter = app.vault.adapter;

		const frontmatter = `---\ntags: obsidian-auto-glossary\n---\n`;

		const fileExistsBool = await this.exists();

		const finalPath = this.getFinalPath();

		if (fileExistsBool && !this.overwrite) {
			new Notice(
				`${finalPath} file already exists. Try again with overwrite enabled or a different file name.`
			);
		} else {
			const filesAndFolders = await this.chosenFolder.getChildren(
				this.IncludeFiles
			);

			const text = await this.createText(filesAndFolders);

			const completeText = frontmatter + text;

			adapter.write(finalPath, completeText);
			//app.vault.create(finalPath, completeText);

			new Notice(
				fileExistsBool ? `${finalPath} updated` : `${finalPath} created`
			);
		}
	}

	getFinalPath(): string {
		let path = "";

		if (this.destFolder) {
			path = this.destFolder.path;
		} else {
			path = this.chosenFolder.path;
		}

		//const fileName = fileName ?? typeof this;
		const normalizedPath = normalizePath(`${path}/${this.name}`);

		return normalizedPath + ".md";
	}

	heading(folder: MyFolder): string {
		let heading = "";
		if (folder.depth !== undefined) {
			if (folder.depth <= 3) {
				let hLevel = "##";

				for (let i = 0; i < folder.depth; i++) {
					hLevel += "#";
				}

				heading = `${hLevel} ${folder.name}`;
			} else {
				heading = `\n**${folder.name}**\n`;
			}
		}

		return heading;
	}

	// Have to use fileType since circular imports are not allowed
	finalText(
		filesAndFoldersStrings: (string | undefined)[],
		fileType: string
	): string {
		const text = filesAndFoldersStrings.join("\n");
		const finalText = `## ${this.ChosenFolder.name} ${fileType}\n${text}`;
		return finalText;
	}
}
