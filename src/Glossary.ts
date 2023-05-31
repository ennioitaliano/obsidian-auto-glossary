import { GeneratedFile } from "GeneratedFile";
import { getFilesAndFolders } from "utils";

export class Glossary extends GeneratedFile {
	async createText(): Promise<string> {
		const filesAndFolders = await getFilesAndFolders({
			includeFiles: this.IncludeFiles,
			startingFolderPath: this.ChosenFolder,
			notesOrder: this.NotesOrder,
		});

		const chosenFolderName =
			this.ChosenFolder?.split("/").pop() ?? app.vault.getName();

		const glossaryEntries = filesAndFolders.map((absFile) => {
			if (absFile.type === "file") {
				return `###### ![[${absFile.name}]]\n***`;
			} else if (absFile.type === "folder") {
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
