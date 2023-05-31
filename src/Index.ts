import { GeneratedFile } from "GeneratedFile";
import { getFilesAndFolders } from "utils";

export class Index extends GeneratedFile {
	async createText(
		fileName?: string,
		isForGlossary?: boolean
	): Promise<string> {
		const filesAndFolders = await getFilesAndFolders({
			includeFiles: this.IncludeFiles,
			startingFolderPath: this.ChosenFolder,
			notesOrder: this.NotesOrder,
		});

		const chosenFolderName =
			this.ChosenFolder?.split("/").pop() ?? app.vault.getName();

		isForGlossary = isForGlossary ?? false;

		const indexEntries = filesAndFolders.map((absFile) => {
			if (absFile.type === "file") {
				return isForGlossary
					? `- [[${fileName}#${absFile.name}|${absFile.name}]]`
					: `- [[${absFile.name}]]`;
			} else if (absFile.type === "folder") {
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
