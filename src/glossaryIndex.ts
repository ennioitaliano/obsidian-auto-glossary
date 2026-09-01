import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import {
	applyTemplate,
	cleanFiles,
	ensureFolderExists,
	FileOrder,
	FileType,
	getEnumFT,
	mergeFrontmatter,
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
	destFolder?: string,
	templatePath?: string
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
		order,
		templatePath
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

			let finalContent = content;
			try {
				const existingContent = await app.vault.cachedRead(existingAbstract);
				finalContent = mergeFrontmatter(existingContent, content);
			} catch (err) {
				console.warn("Could not read existing file for metadata merge:", err);
			}

			await app.vault.modify(existingAbstract, finalContent);
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
	order?: FileOrder | string,
	templatePath?: string
): Promise<string> {
	const [indexText, glossaryText] = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		order
	);

	const fileTypeNormalized = getEnumFT(
		typeof requestedFile === "string" ? requestedFile : undefined
	);

	let generatedContent = "";
	switch (fileTypeNormalized) {
		case FileType.Glossary:
			generatedContent = glossaryText;
			break;
		case FileType.Index:
			generatedContent = indexText;
			break;
		case FileType.GlossaryIndex:
		default:
			generatedContent = `${indexText}\n***\n\n${glossaryText}`;
			break;
	}

	const normalizedChosenFolder = chosenFolder && chosenFolder !== "/" ? normalizePath(chosenFolder) : "";
	const folderName = normalizedChosenFolder ? normalizedChosenFolder.split("/").pop() || "Vault" : "Vault";

	if (templatePath && templatePath.trim() !== "") {
		const normalizedTemplatePath = normalizePath(
			templatePath.endsWith(".md") ? templatePath.trim() : `${templatePath.trim()}.md`
		);
		const templateAbstract = app.vault.getAbstractFileByPath(normalizedTemplatePath);

		if (templateAbstract instanceof TFile) {
			try {
				const templateContent = await app.vault.cachedRead(templateAbstract);
				return applyTemplate(templateContent, {
					title: fileName,
					folder: folderName,
					folderPath: normalizedChosenFolder,
					indexContent: indexText,
					glossaryContent: glossaryText,
					content: generatedContent,
				});
			} catch (err) {
				console.error("Failed to read template file:", err);
				new Notice(`Auto Glossary: Could not read template "${normalizedTemplatePath}". Using default format.`);
			}
		} else {
			new Notice(`Auto Glossary: Template "${normalizedTemplatePath}" not found. Using default format.`);
		}
	}

	return `---\ntags:\n  - obsidian-auto-glossary\n---\n${generatedContent}`;
}


