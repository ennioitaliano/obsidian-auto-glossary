import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import {
	cleanFiles,
	ensureFolderExists,
	FileOrder,
	FileType,
	getEnumFT,
	sortFiles,
} from "./utils";

export async function createArrays(
	app: App,
	requestedFile: FileType | string,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	order?: FileOrder | string
): Promise<[string, string]> {
	let notesTFile: TFile[] = app.vault.getMarkdownFiles();

	// Filter files within the specified folder
	if (chosenFolder && chosenFolder !== "/" && chosenFolder !== "") {
		const normalizedFolder = normalizePath(chosenFolder);
		notesTFile = notesTFile.filter((file) => {
			return file.path.startsWith(normalizedFolder + "/");
		});
	}

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app.vault, notesTFile, app.metadataCache);
	}

	if (order) {
		notesTFile = sortFiles(notesTFile, order);
	}

	const glossaryArray: string[] = [];
	const indexArray: string[] = [];

	const isGlossaryIndex =
		requestedFile === FileType.GlossaryIndex || requestedFile === "glossaryIndex";

	for (const file of notesTFile) {
		const noteName = file.basename;

		if (isGlossaryIndex) {
			indexArray.push(`- [[#${noteName}|${noteName}]]\n`);
		} else {
			indexArray.push(`- [[${noteName}]]\n`);
		}

		glossaryArray.push(`### ${noteName}\n\n![[${noteName}]]\n\n***\n\n`);
	}

	const indexText = `## Index\n${indexArray.join("")}`;
	const glossaryText = `## Glossary\n${glossaryArray.join("")}`;

	return [indexText, glossaryText];
}

export async function createFile(
	app: App,
	requestedFile: FileType | string,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	order?: FileOrder | string,
	destFolder?: string
): Promise<TFile | null> {
	let rawPath = "";

	const baseName = fileName ? fileName.replace(/\.md$/, "") : String(requestedFile);

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
				return null;
			}
			await app.vault.modify(existingAbstract, content);
			new Notice(`Updated: ${completeFilePath}`);
			return existingAbstract;
		} else if (existingAbstract instanceof TFolder) {
			new Notice(`Error: A folder named "${completeFilePath}" already exists.`);
			return null;
		} else {
			// Ensure parent folder structure exists recursively if writing to a subfolder
			const folderPath = completeFilePath.substring(0, completeFilePath.lastIndexOf("/"));
			if (folderPath) {
				await ensureFolderExists(app.vault, folderPath);
			}

			const createdFile = await app.vault.create(completeFilePath, content);
			new Notice(`Created: ${completeFilePath}`);
			return createdFile;
		}
	} catch (err) {
		console.error("Auto Glossary failed to create or update file:", err);
		new Notice(`Auto Glossary error: Failed to save "${completeFilePath}"`);
		return null;
	}
}

export async function createText(
	app: App,
	requestedFile: FileType | string,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	order?: FileOrder | string
): Promise<string> {
	const [indexText, glossaryText] = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		order
	);

	let text = "---\ntags:\n  - obsidian-auto-glossary\n---\n";

	const fileTypeNormalized = getEnumFT(
		typeof requestedFile === "string" ? requestedFile : undefined
	);

	switch (fileTypeNormalized) {
		case FileType.Glossary:
			text += glossaryText;
			break;
		case FileType.Index:
			text += indexText;
			break;
		case FileType.GlossaryIndex:
		default:
			text += `${indexText}\n***\n\n${glossaryText}`;
			break;
	}

	return text;
}


