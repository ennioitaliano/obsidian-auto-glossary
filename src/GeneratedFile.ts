import { DataAdapter, Notice, normalizePath } from "obsidian";
import { NotesOrder } from "utils";

export abstract class GeneratedFile {
	private completePath: string;
	private includeFiles: boolean;
	private overwrite: boolean;
	private chosenFolder?: string;
	private notesOrder?: NotesOrder;
	private destFolder?: string;

	abstract createText(
		fileName?: string,
		isForGlossary?: boolean
	): Promise<string>;

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
			const text = await this.createText(
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
}
