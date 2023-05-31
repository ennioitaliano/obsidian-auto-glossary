import { GeneratedFile } from "GeneratedFile";
import { Glossary } from "Glossary";
import { Index } from "Index";
import { TAbstractFile } from "obsidian";
export class GlossaryIndex extends GeneratedFile {
	index = new Index(
		super.getFileName(),
		super.IncludeFiles,
		super.Overwrite,
		super.ChosenFolder,
		super.NotesOrder,
		super.CompletePath
	);

	glossary = new Glossary(
		super.getFileName(),
		super.IncludeFiles,
		super.Overwrite,
		super.ChosenFolder,
		super.NotesOrder,
		super.CompletePath
	);

	async createText(
		filesAndFolders: TAbstractFile[],
		chosenFolderName: string,
		fileName: string
	): Promise<string> {
		const indexText = await this.index.createText(
			filesAndFolders,
			chosenFolderName,
			fileName,
			true
		);

		const glossaryText = await this.glossary.createText(
			filesAndFolders,
			chosenFolderName
		);

		const finalText = `${indexText}\n\n***\n\n${glossaryText}`;

		return finalText;
	}
}
