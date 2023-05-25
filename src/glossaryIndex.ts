import {
	NotesOrder,
	getFilesAndFolders,
} from "./utils";

export async function createIndex(
	includeFiles: boolean,
	chosenFolder?: string,
	notesOrder?: NotesOrder,
	isForGlossary?: boolean,
	fileName?: string
): Promise<string> {
	const filesAndFolders = await getFilesAndFolders({
		includeFiles,
		startingFolderPath: chosenFolder,
		notesOrder,
	});

	const chosenFolderName =
		chosenFolder?.split("/").pop() ?? app.vault.getName();

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

export async function createGlossary(
	includeFiles: boolean,
	chosenFolder?: string,
	notesOrder?: NotesOrder
): Promise<string> {
	const filesAndFolders = await getFilesAndFolders({
		includeFiles,
		startingFolderPath: chosenFolder,
		notesOrder,
	});

	const chosenFolderName =
		chosenFolder?.split("/").pop() ?? app.vault.getName();

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

export async function createGlossaryIndex(
	includeFiles: boolean,
	fileName: string,
	chosenFolder?: string,
	notesOrder?: NotesOrder
): Promise<string> {
	const indexText = await createIndex(
		includeFiles,
		chosenFolder,
		notesOrder,
		true,
		fileName
	);

	const glossaryText = await createGlossary(
		includeFiles,
		chosenFolder,
		notesOrder
	);

	const finalText = `${indexText}\n\n***\n\n${glossaryText}`;

	return finalText;
}
