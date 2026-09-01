import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import {
	fileType,
	cleanFiles,
	sortFiles,
	fileOrder,
} from "./utils";

export async function createArrays(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	order?: fileOrder
): Promise<[string, string]> {
	let notesTFile: TFile[] = app.vault.getMarkdownFiles();

	// Filter files within the specified folder
	if (chosenFolder && chosenFolder !== "/" && chosenFolder !== "") {
		const normalizedFolder = normalizePath(chosenFolder);
		notesTFile = notesTFile.filter((file) => {
			if (file.parent && file.parent.path === normalizedFolder) {
				return true;
			}
			return file.path.startsWith(normalizedFolder + "/");
		});
	}

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app.vault, notesTFile);
	}

	if (order) {
		notesTFile = sortFiles(notesTFile, order);
	}

	const glossaryArray: string[] = [];
	const indexArray: string[] = [];

	for (const file of notesTFile) {
		const noteName = file.basename;

		if (requestedFile === fileType.gi) {
			const targetName = fileName ? fileName.replace(/\.md$/, "") : requestedFile;
			indexArray.push(`- [[${targetName}#${noteName}|${noteName}]]\n`);
		} else {
			indexArray.push(`- [[${noteName}]]\n`);
		}

		glossaryArray.push(`#### ![[${noteName}]]\n\n***\n\n`);
	}

	const indexText = `## Index\n${indexArray.join("")}`;
	const glossaryText = `## Glossary\n${glossaryArray.join("")}`;

	return [indexText, glossaryText];
}

export async function createFile(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	order?: fileOrder,
	destFolder?: string
): Promise<void> {
	let rawPath = "";

	const baseName = fileName ? fileName.replace(/\.md$/, "") : requestedFile;

	if (destFolder && destFolder.trim() !== "") {
		rawPath = `${destFolder}/${baseName}.md`;
	} else if (chosenFolder && chosenFolder.trim() !== "") {
		rawPath = `${chosenFolder}/${baseName}.md`;
	} else {
		rawPath = `${baseName}.md`;
	}

	const completeFilePath = normalizePath(rawPath);

	const content = await createText(
		app,
		requestedFile,
		fileInclusion,
		baseName,
		chosenFolder,
		order
	);

	try {
		const existingAbstract = app.vault.getAbstractFileByPath(completeFilePath);

		if (existingAbstract instanceof TFile) {
			if (!fileOverwrite) {
				new Notice(
					`"${completeFilePath}" already exists. Enable overwrite or choose a different name.`
				);
				return;
			}
			await app.vault.modify(existingAbstract, content);
			new Notice(`Updated: ${completeFilePath}`);
		} else if (existingAbstract instanceof TFolder) {
			new Notice(`Error: A folder named "${completeFilePath}" already exists.`);
			return;
		} else {
			// Ensure parent folder exists if writing to a subfolder
			const folderPath = completeFilePath.substring(0, completeFilePath.lastIndexOf("/"));
			if (folderPath && !app.vault.getAbstractFileByPath(folderPath)) {
				await app.vault.createFolder(folderPath);
			}

			await app.vault.create(completeFilePath, content);
			new Notice(`Created: ${completeFilePath}`);
		}
	} catch (err) {
		console.error("Auto Glossary failed to create or update file:", err);
		new Notice(`Auto Glossary error: Failed to save "${completeFilePath}"`);
	}
}

async function createText(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	order?: fileOrder
): Promise<string> {
	const [indexText, glossaryText] = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		order
	);

	let text = "---\ntags: obsidian-auto-glossary\n---\n";

	switch (requestedFile) {
		case fileType.g:
			text += glossaryText;
			break;
		case fileType.i:
			text += indexText;
			break;
		case fileType.gi:
			text += `${indexText}\n***\n\n${glossaryText}`;
			break;
		default:
			break;
	}

	return text;
}

