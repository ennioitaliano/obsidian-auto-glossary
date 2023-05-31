import { GeneratedFile } from "GeneratedFile";
import { Glossary } from "Glossary";
import { Index } from "Index";
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
		fileName: string
	): Promise<string> {
		const indexText = await this.index.createText(
			fileName,
			true
		);

		const glossaryText = await this.glossary.createText();

		const finalText = `${indexText}\n\n***\n\n${glossaryText}`;

		return finalText;
	}
}
