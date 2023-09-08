import { DataAdapter, Notice, TAbstractFile, normalizePath } from "obsidian";
import { MyFolder, AutoGlossarySettings } from "./old/modules_OLD";

export class GeneratedFile {
	protected name: string;
	protected folder: MyFolder;
	protected settings: AutoGlossarySettings;

	createText(
		filesAndFolders: TAbstractFile[],
		isForGlossary?: boolean
	): Promise<string> {
		throw new Error("Method not implemented.");
	}

	constructor(
		name: string,
		folder: MyFolder,
		settings: AutoGlossarySettings
	) {
		this.name = name;
		this.folder = folder;
		this.settings = settings;
	}

	get Name(): string {
		return this.name;
	}

	set Name(value: string) {
		this.name = value;
	}

	get Folder(): MyFolder {
		return this.folder;
	}

	get Settings(): AutoGlossarySettings {
		return this.settings;
	}

	set Settings(value: AutoGlossarySettings) {
		this.settings = value;
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

		if (fileExistsBool && !this.settings.fileOverwrite) {
			new Notice(
				`${finalPath} file already exists. Try again with overwrite enabled or a different file name.`
			);
		} else {
			const filesAndFolders = await this.folder.getChildren(
				this.settings.filesInclusion
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

		if (this.settings.destination) {
			path = this.settings.destination;
		} else {
			path = this.folder.path;
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
		const finalText = `## ${this.folder.name} ${fileType}\n${text}`;
		return finalText;
	}
}
