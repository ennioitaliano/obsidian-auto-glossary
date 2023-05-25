import {
	createIndex,
	createGlossary,
	createGlossaryIndex,
} from "glossaryIndex";
import { DataAdapter, Notice, normalizePath } from "obsidian";
import { FileType, NotesOrder } from "utils";

export class GeneratedFile {
	private type: FileType;
	private completePath: string;
	private chosenFolder?: string;
	private notesOrder?: NotesOrder;
	private destFolder?: string;

	constructor(
		type: FileType,
		fileName: string,
		chosenFolder?: string,
		notesOrder?: NotesOrder,
		destFolder?: string
	) {
		this.type = type;
		this.chosenFolder =
			chosenFolder === app.vault.getName()
				? (chosenFolder = "")
				: chosenFolder;
		this.notesOrder = notesOrder;
		this.destFolder = destFolder;
		this.completePath = this.setCompletePath(fileName);
	}

	setCompletePath(name: string): string {
		let completePath = "";

		if (this.destFolder) {
			completePath = this.destFolder;
		} else if (this.chosenFolder) {
			completePath = this.chosenFolder;
		}

		const fileName = name ?? this.type;
		const normalizedPath = normalizePath(`${completePath}/${fileName}`);

		return normalizedPath + ".md";
	}

	getFileName(): string {
		return this.completePath.split("/").pop() ?? "";
	}

	async writeFile(includeFiles: boolean, overwrite: boolean) {
		const adapter: DataAdapter = app.vault.adapter;
		const frontmatter = `---\ntags: obsidian-auto-glossary\n---\n`;

		const fileExistsBool = await this.exists();

		if (fileExistsBool && !overwrite) {
			new Notice(
				`${this.completePath} file already exists. Try again with overwrite enabled or a different file name.`
			);
		} else {
			let text: string;
			switch (this.type) {
				case "index":
					text = await createIndex(
						includeFiles,
						this.chosenFolder,
						this.notesOrder
					);

					break;
				case "glossary":
					text = await createGlossary(
						includeFiles,
						this.chosenFolder,
						this.notesOrder
					);
					break;

				case "glossaryindex":
					text = await createGlossaryIndex(
						includeFiles,
						this.getFileName(),
						this.chosenFolder,
						this.notesOrder
					);
					break;
			}
			const completeText = frontmatter + text;
			adapter.write(this.completePath, completeText);
			new Notice(
				fileExistsBool
					? `${this.completePath} updated`
					: `${this.completePath} created`
			);
		}
	}

	async exists(): Promise<boolean> {
		const adapter: DataAdapter = app.vault.adapter;
		const result = await adapter.exists(this.completePath);

		if (result) {
			console.log(`File ${this.completePath} already exists`);
		}

		return result;
	}
}
