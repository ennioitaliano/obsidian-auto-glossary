import { GeneratedFile, Glossary, Index } from "./old/modules_OLD";
import { TAbstractFile } from "obsidian";

export class GlossaryIndex extends GeneratedFile {
	index = new Index(
		super.name,
		super.folder,
		super.settings,
	);

	glossary = new Glossary(
		super.name,
		super.folder,
		super.settings
	);

	async createText(filesAndFolders: TAbstractFile[]): Promise<string> {
		const indexText = await this.index.createText(filesAndFolders, true);

		const glossaryText = await this.glossary.createText(filesAndFolders);

		const finalText = `${indexText}\n\n***\n\n${glossaryText}`;

		return finalText;
	}
}
