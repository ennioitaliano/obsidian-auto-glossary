import { GeneratedFile } from "GeneratedFile";
import { MyFolder } from "MyFolder";
import { TAbstractFile, TFile } from "obsidian";

export class Index extends GeneratedFile {
	async createText(
		filesAndFolders: TAbstractFile[],
		isForGlossary?: boolean
	): Promise<string> {
		isForGlossary = isForGlossary ?? false;

		const indexEntries = filesAndFolders.map((absFile) => {
			if (absFile instanceof TFile) {
				return isForGlossary
					? `- [[${this.Name}#${absFile.basename}|${absFile.basename}]]`
					: `- [[${absFile.basename}]]`;
			} else if (absFile instanceof MyFolder) {
				return this.heading(absFile);
			}
		});

		const indexText = indexEntries.join("\n");
		const finalText = `## ${this.ChosenFolder.name} Index\n${indexText}`;
		return finalText;
	}
}
