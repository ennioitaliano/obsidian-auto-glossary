import { GeneratedFile } from "GeneratedFile";
import { MyFolder } from "MyFolder";
import { TAbstractFile, TFile } from "obsidian";
export class Glossary extends GeneratedFile {
	async createText(filesAndFolders: TAbstractFile[]): Promise<string> {
		const glossaryEntries = filesAndFolders.map((absFile) => {
			if (absFile instanceof TFile) {
				return `###### ![[${absFile.basename}]]\n***`;
			} else if (absFile instanceof MyFolder) {
				return this.heading(absFile);
			}
		});
		
		const glossaryText = glossaryEntries.join("\n");
		const finalText = `## ${this.ChosenFolder.name} Glossary\n${glossaryText}`;
		return finalText;
	}
}
