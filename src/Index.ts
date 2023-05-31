import { GeneratedFile } from "GeneratedFile";
import { MyFolder } from "MyFolder";
import { TAbstractFile, TFile } from "obsidian";

export class Index extends GeneratedFile {
	async createText(
		filesAndFolders: TAbstractFile[],
		chosenFolderName: string,
		fileName?: string,
		isForGlossary?: boolean
	): Promise<string> {
		isForGlossary = isForGlossary ?? false;

		const indexEntries = filesAndFolders.map((absFile) => {
			if (absFile instanceof TFile) {
				return isForGlossary
					? `- [[${fileName}#${absFile.basename}|${absFile.basename}]]`
					: `- [[${absFile.basename}]]`;
			} else if (absFile instanceof MyFolder) {
				if (absFile.depth !== undefined) {
					if (absFile.depth <= 3) {
						let hLevel = "###";

						for (let i = 0; i < absFile.depth; i++) {
							hLevel += "#";
						}

						return `${hLevel} ${absFile.name}`;
					} else {
						return `**${absFile.name}**`;
					}
				}
			}
		});

		const indexText = indexEntries.join("\n");
		const finalText = `## ${chosenFolderName} Index\n${indexText}`;
		return finalText;
	}
}
