import { MyFolder, AutoGlossarySettings, NotesOrder } from "./modules_OLD";
import {
	DataAdapter,
	Notice,
	TAbstractFile,
	TFolder,
	normalizePath,
} from "obsidian";

export class GeneratedFile_old {
	private name: string;
	private folder: MyFolder;
	private settings: AutoGlossarySettings;
	// private fileInclusion: boolean;
	// private overwrite: boolean;
	// private notesOrder: NotesOrder;
	// private destination?: TFolder;

// 	createText(
// 		filesAndFolders: TAbstractFile[],
// 		isForGlossary?: boolean
// 	): Promise<string> {
// 		throw new Error("Method not implemented.");
// 	}

	constructor(name: string, folder: MyFolder, settings: AutoGlossarySettings) {
		this.name = name;
		this.folder = folder;
		this.settings = settings;
	}


// 	constructor({
// 		name,
// 		contentsFolder,
// 		settings,
// 		includeFiles,
// 		overwrite,
// 		notesOrder,
// 		destFolder,
// 	}: {
// 		name: string;
// 		contentsFolder: MyFolder;
// 		settings?: AutoGlossarySettings;
// 		includeFiles?: boolean;
// 		overwrite?: boolean;
// 		notesOrder?: NotesOrder;
// 		destFolder?: TFolder;
// 	}) {
// 		this.name = name;
// 		this.contents = contentsFolder;

// 		console.log(this.contents instanceof MyFolder);

// 		if (settings) {
// 			this.fileInclusion = settings.includeFiles;
// 			this.overwrite = settings.fileOverwrite;
// 			this.notesOrder = settings.fileOrder;
// 			this.destination = settings.sameDest
// 				? contentsFolder
// 				: (app.vault.getAbstractFileByPath(
// 						settings.fileDest
// 				) as TFolder);
// 		} else if (includeFiles && overwrite && notesOrder && destFolder) {
// 			this.fileInclusion = includeFiles;
// 			this.overwrite = overwrite;
// 			this.notesOrder = notesOrder;
// 			this.destination = destFolder;
// 		}
// 	}

// 	get contentsFolder(): MyFolder {
// 		return this.contents;
// 	}

// 	set NotesOrder(notesOrder: NotesOrder) {
// 		this.notesOrder = notesOrder;
// 	}

// 	get NotesOrder(): NotesOrder {
// 		return this.notesOrder;
// 	}

// 	set IncludeFiles(includeFiles: boolean) {
// 		this.fileInclusion = includeFiles;
// 	}

// 	get IncludeFiles(): boolean {
// 		return this.fileInclusion;
// 	}

// 	set Overwrite(overwrite: boolean) {
// 		this.overwrite = overwrite;
// 	}

// 	get Overwrite(): boolean {
// 		return this.overwrite;
// 	}

// 	set Name(name: string) {
// 		this.name = name;
// 	}

// 	get Name(): string {
// 		return this.name;
// 	}

// 	set DestFolder(destFolder: TFolder | undefined) {
// 		this.destination = destFolder;
// 	}

// 	get DestFolder(): TFolder | undefined {
// 		return this.destination;
// 	}

// 	async exists(): Promise<boolean> {
// 		const adapter: DataAdapter = app.vault.adapter;
// 		const finalPath = this.getFinalPath();
// 		const result = await adapter.exists(finalPath);

// 		if (result) {
// 			console.log(`File ${finalPath} already exists`);
// 		}

// 		return result;
// 	}

// 	async writeFile() {
// 		const adapter: DataAdapter = app.vault.adapter;

// 		const frontmatter = `---\ntags: obsidian-auto-glossary\n---\n`;

// 		const fileExistsBool = await this.exists();

// 		const finalPath = this.getFinalPath();

// 		if (fileExistsBool && !this.overwrite) {
// 			new Notice(
// 				`${finalPath} file already exists. Try again with overwrite enabled or a different file name.`
// 			);
// 		} else {
// 			const filesAndFolders = await this.contents.getChildren(
// 				this.IncludeFiles
// 			);

// 			const text = await this.createText(filesAndFolders);

// 			const completeText = frontmatter + text;

// 			adapter.write(finalPath, completeText);
// 			//app.vault.create(finalPath, completeText);

// 			new Notice(
// 				fileExistsBool ? `${finalPath} updated` : `${finalPath} created`
// 			);
// 		}
// 	}

// 	getFinalPath(): string {
// 		let path = "";

// 		if (this.destination) {
// 			path = this.destination.path;
// 		} else {
// 			path = this.contents.path;
// 		}

// 		//const fileName = fileName ?? typeof this;
// 		const normalizedPath = normalizePath(`${path}/${this.name}`);

// 		return normalizedPath + ".md";
// 	}

// 	heading(folder: MyFolder): string {
// 		let heading = "";
// 		if (folder.depth !== undefined) {
// 			if (folder.depth <= 3) {
// 				let hLevel = "##";

// 				for (let i = 0; i < folder.depth; i++) {
// 					hLevel += "#";
// 				}

// 				heading = `${hLevel} ${folder.name}`;
// 			} else {
// 				heading = `\n**${folder.name}**\n`;
// 			}
// 		}

// 		return heading;
// 	}

// 	// Have to use fileType since circular imports are not allowed
// 	finalText(
// 		filesAndFoldersStrings: (string | undefined)[],
// 		fileType: string
// 	): string {
// 		const text = filesAndFoldersStrings.join("\n");
// 		const finalText = `## ${this.contents.name} ${fileType}\n${text}`;
// 		return finalText;
// 	}
}
