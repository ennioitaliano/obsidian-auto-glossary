import { DataAdapter, Notice } from "obsidian";
import { fileExists, NotesOrder, fileNamer, getNotes, FileType } from "./utils";

export async function createIndex(
	includeFiles: boolean,
	chosenFolder?: string,
	notesOrder?: NotesOrder
): Promise<string> {
	const files = await getNotes({
		includeFiles,
		rootPath: chosenFolder,
		notesOrder,
	});

	const chosenFolderName =
		chosenFolder?.split("/").pop() ?? app.vault.getName();

	const indexEntries: string[] = [];

	files.forEach((file) => {
		if (file.type === "file") {
			indexEntries.push(`- [[${file.name}]]`);
		} else if (file.type === "folder") {
			console.log(file);
			if (file.depth!==undefined) {
				if (file.depth <= 3) {
					let hLevel = "###";

					for (let i = 0; i < file.depth; i++) {
						hLevel += "#";
					}

					indexEntries.push(`${hLevel} ${file.name}`);
				} else {
					indexEntries.push(`**${file.name}**`);
				}
			}
		}
	});

	const indexText = indexEntries.join("\n");
	const finalText = `## ${chosenFolderName} Index\n${indexText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossary(
	includeFiles: boolean,
	chosenFolder?: string,
	notesOrder?: NotesOrder
): Promise<string> {
	const noteNames = await getNotes({
		includeFiles,
		rootPath: chosenFolder,
		notesOrder,
	});
	const glossaryEntries = noteNames.map(
		(name) => `#### ![[${name}]]\n\n***\n\n`
	);
	const glossaryText = glossaryEntries.join("");
	const finalText = `## Glossary\n${glossaryText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossaryIndex(
	includeFiles: boolean,
	fileName: string,
	chosenFolder?: string,
	notesOrder?: NotesOrder
): Promise<string> {
	const noteNames = await getNotes({
		includeFiles,
		rootPath: chosenFolder,
		notesOrder,
	});
	const indexEntries = noteNames.map(
		(name) => `- [[${fileName}#${name}|${name}]]`
	);
	const indexText = indexEntries.join("\n");
	const glossaryEntries = noteNames.map(
		(name) => `#### ![[${name}]]\n\n***\n\n`
	);
	const glossaryText = glossaryEntries.join("");
	const finalText = `## Index\n${indexText}\n\n***\n\n## Glossary\n${glossaryText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createIndexFile(
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	notesOrder?: NotesOrder,
	destFolder?: string
) {
	if (chosenFolder === app.vault.getName()) {
		chosenFolder = "";
	}

	const fileType: FileType = "index";

	const completeFileName = fileNamer({
		fileType,
		fileName,
		chosenFolder,
		destFolder,
	});

	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool) {
		if (overwrite) {
			adapter.write(
				completeFileName + ".md",
				await createIndex(includeFiles, chosenFolder, notesOrder)
			);
			new Notice(`${completeFileName} updated`);
		} else {
			new Notice(
				`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
			);
		}
	} else {
		adapter.write(
			completeFileName + ".md",
			await createIndex(includeFiles, chosenFolder, notesOrder)
		);
		new Notice(`${completeFileName} created`);
	}
}

export async function createGlossaryFile(
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	notesOrder?: NotesOrder,
	destFolder?: string
) {
	if (chosenFolder === app.vault.getName()) {
		chosenFolder = "";
	}

	const fileType: FileType = "glossary";

	const completeFileName = fileNamer({
		fileType,
		fileName,
		chosenFolder,
		destFolder,
	});
	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool) {
		if (overwrite) {
			adapter.write(
				completeFileName + ".md",
				await createGlossary(includeFiles, chosenFolder, notesOrder)
			);
			new Notice(`${completeFileName} updated`);
		} else {
			new Notice(
				`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
			);
		}
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossary(includeFiles, chosenFolder, notesOrder)
		);
		new Notice(`${completeFileName} created`);
	}
}

export async function createGlossaryIndexFile(
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	notesOrder?: NotesOrder,
	destFolder?: string
) {
	if (chosenFolder === app.vault.getName()) {
		chosenFolder = "";
	}

	const fileType: FileType = "glossaryindex";

	const completeFileName = fileNamer({
		fileType,
		fileName,
		chosenFolder,
		destFolder,
	});
	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool) {
		if (overwrite) {
			adapter.write(
				completeFileName + ".md",
				await createGlossaryIndex(
					includeFiles,
					fileName,
					chosenFolder,
					notesOrder
				)
			);
			new Notice(`${completeFileName} updated`);
		} else {
			new Notice(
				`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
			);
		}
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossaryIndex(
				includeFiles,
				fileName,
				chosenFolder,
				notesOrder
			)
		);
		new Notice(`${completeFileName} created`);
	}
}
