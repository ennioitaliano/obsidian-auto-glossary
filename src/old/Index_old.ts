import { GeneratedFile, MyFolder } from "./modules_OLD";
import { TAbstractFile, TFile } from "obsidian";

export class Index_old extends GeneratedFile {
	// async createText(
	// 	filesAndFolders: TAbstractFile[],
	// 	isForGlossary?: boolean
	// ): Promise<string> {
	// 	isForGlossary = isForGlossary ?? false;

	// 	const indexEntries = filesAndFolders.map((absFile) => {
	// 		if (absFile instanceof TFile) {
	// 			return isForGlossary
	// 				? `- [[${this.Name}#${absFile.basename}|${absFile.basename}]]`
	// 				: `- [[${absFile.basename}]]`;
	// 		} else if (absFile instanceof MyFolder) {
	// 			return this.heading(absFile);
	// 		}
	// 	});

	// 	return this.finalText(indexEntries, "Index");
	// }
}
