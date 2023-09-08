import { GeneratedFile, MyFolder } from "./old/modules_OLD";
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

		return this.finalText(glossaryEntries, "Glossary");
	}
}
