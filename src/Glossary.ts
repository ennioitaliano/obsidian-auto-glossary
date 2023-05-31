import { GeneratedFile } from "GeneratedFile";
import { MyFolder } from "MyFolder";
import { TAbstractFile, TFile } from "obsidian";
export class Glossary extends GeneratedFile {
	async createText(
		filesAndFolders: TAbstractFile[],
		chosenFolderName: string
	): Promise<string> {
		const glossaryEntries = filesAndFolders.map((absFile) => {
			if (absFile instanceof TFile) {
				return `###### ![[${absFile.basename}]]\n***`;
			} else if (absFile instanceof MyFolder) {
				if (absFile.depth !== undefined) {
					if (absFile.depth <= 2) {
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

		const glossaryText = glossaryEntries.join("\n");
		const finalText = `## ${chosenFolderName} Glossary\n${glossaryText}`;
		return finalText;
	}
}
