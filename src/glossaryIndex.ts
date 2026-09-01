import { App, normalizePath, Notice, TFile, TFolder } from "obsidian";
import {
	applyTemplate,
	buildFolderTree,
	cleanFiles,
	ensureFolderExists,
	FileOrder,
	FileType,
	filterFiles,
	FolderTreeNode,
	getEnumFT,
	mergeFrontmatter,
} from "./utils";

export interface CreateFileOptions {
	includeSubfolders?: boolean;
	includeEmptyFolders?: boolean;
	includeNonMarkdown?: boolean;
	nonMarkdownExtensions?: string;
	excludedTags?: string | string[];
}

function renderIndexSection(
	node: FolderTreeNode,
	isGlossaryIndex: boolean,
	lines: string[]
): void {
	if (node.relativeDepth > 0 && !node.isEmpty) {
		const headingLevel = "#".repeat(Math.min(6, 2 + node.relativeDepth));
		lines.push(`${headingLevel} ${node.name}\n\n`);
	}

	for (const file of node.files) {
		const isMd = !file.extension || file.extension.toLowerCase() === "md";
		const noteName = isMd ? file.basename : file.name;
		if (isGlossaryIndex) {
			lines.push(`- [[#${noteName}|${noteName}]]\n`);
		} else {
			lines.push(`- [[${noteName}]]\n`);
		}
	}

	for (const subfolder of node.subfolders) {
		if (subfolder.isEmpty) {
			lines.push(`- ${subfolder.name}/\n`);
		} else {
			if (lines.length > 0 && !lines[lines.length - 1].endsWith("\n\n")) {
				lines.push("\n");
			}
			renderIndexSection(subfolder, isGlossaryIndex, lines);
		}
	}
}

export function renderIndexText(
	rootNode: FolderTreeNode,
	isGlossaryIndex: boolean
): string {
	const lines: string[] = ["## Index\n"];
	renderIndexSection(rootNode, isGlossaryIndex, lines);
	return lines.join("");
}

function renderGlossarySection(
	node: FolderTreeNode,
	sections: string[]
): void {
	if (node.relativeDepth > 0 && !node.isEmpty) {
		const headingLevel = "#".repeat(Math.min(6, 2 + node.relativeDepth));
		sections.push(`${headingLevel} ${node.name}\n\n`);
	}

	for (const file of node.files) {
		const isMd = !file.extension || file.extension.toLowerCase() === "md";
		const noteName = isMd ? file.basename : file.name;
		const headingLevel = "#".repeat(Math.min(6, 3 + node.relativeDepth));
		sections.push(`${headingLevel} ${noteName}\n\n![[${noteName}]]\n\n***\n\n`);
	}

	for (const subfolder of node.subfolders) {
		if (!subfolder.isEmpty) {
			renderGlossarySection(subfolder, sections);
		}
	}
}

export function renderGlossaryText(rootNode: FolderTreeNode): string {
	const sections: string[] = ["## Glossary\n"];
	renderGlossarySection(rootNode, sections);
	return sections.join("");
}

export async function createArrays(
	app: App,
	requestedFile: FileType | string,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	order?: FileOrder | string,
	options?: CreateFileOptions
): Promise<[string, string]> {
	let files: TFile[] = [];

	if (options?.includeNonMarkdown && typeof app.vault.getFiles === "function") {
		files = app.vault.getFiles();
	} else if (typeof app.vault.getMarkdownFiles === "function") {
		files = app.vault.getMarkdownFiles();
	} else if (typeof app.vault.getFiles === "function") {
		files = app.vault.getFiles();
	}

	// Filter files within the specified folder
	const rawChosen = chosenFolder ? normalizePath(chosenFolder) : "";
	const normalizedChosenFolder = rawChosen === "/" || rawChosen === "." ? "" : rawChosen;

	if (normalizedChosenFolder) {
		files = files.filter((file) => {
			return file.path.startsWith(normalizedChosenFolder + "/");
		});
	}

	files = filterFiles(
		files,
		options?.includeNonMarkdown ?? false,
		options?.nonMarkdownExtensions
	);

	const excludedTags = options?.excludedTags;
	const shouldFilterAutoGlossary = !fileInclusion;

	if (shouldFilterAutoGlossary || (excludedTags && excludedTags.length > 0)) {
		files = await cleanFiles(
			app.vault,
			files,
			app.metadataCache,
			excludedTags,
			shouldFilterAutoGlossary
		);
	}

	const isGlossaryIndex =
		requestedFile === FileType.GlossaryIndex || requestedFile === "glossaryIndex";

	let knownFolderPaths: string[] | undefined;
	if (options?.includeEmptyFolders && typeof app.vault.getAllLoadedFiles === "function") {
		try {
			const loaded = app.vault.getAllLoadedFiles();
			knownFolderPaths = loaded
				.filter(
					(f): f is TFolder =>
						f instanceof TFolder ||
						"children" in f ||
						(!("extension" in f) && !("basename" in f) && "path" in f)
				)
				.map((f) => f.path)
				.filter((p) => p && p !== "/" && p !== ".");
		} catch {
			knownFolderPaths = undefined;
		}
	}

	const folderName = normalizedChosenFolder ? normalizedChosenFolder.split("/").pop() || "Vault" : "Vault";

	const rootNode = buildFolderTree(
		normalizedChosenFolder,
		folderName,
		files,
		{
			includeSubfolders: options?.includeSubfolders !== false,
			includeEmptyFolders: options?.includeEmptyFolders === true,
			fileOrder: order,
			knownFolderPaths,
		}
	);

	const indexText = renderIndexText(rootNode, isGlossaryIndex);
	const glossaryText = renderGlossaryText(rootNode);

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
	templatePath?: string,
	options?: CreateFileOptions
): Promise<TFile | null> {
	let rawPath = "";

	const baseName = fileName ? fileName.replace(/\.md$/, "") : String(requestedFile);

	const rawDest = destFolder && destFolder.trim() !== "" ? normalizePath(destFolder.trim()) : "";
	const normalizedDest = rawDest === "/" || rawDest === "." ? "" : rawDest;

	const rawChosen = chosenFolder && chosenFolder.trim() !== "" ? normalizePath(chosenFolder.trim()) : "";
	const normalizedChosen = rawChosen === "/" || rawChosen === "." ? "" : rawChosen;

	if (normalizedDest) {
		rawPath = `${normalizedDest}/${baseName}.md`;
	} else if (normalizedChosen) {
		rawPath = `${normalizedChosen}/${baseName}.md`;
	} else {
		rawPath = `${baseName}.md`;
	}

	const completeFilePath = normalizePath(rawPath);

	const content = await createText(
		app,
		requestedFile,
		fileInclusion,
		baseName,
		normalizedChosen,
		order,
		templatePath,
		options
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
			const folderPath = completeFilePath.includes("/")
				? completeFilePath.substring(0, completeFilePath.lastIndexOf("/"))
				: "";
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
	templatePath?: string,
	options?: CreateFileOptions
): Promise<string> {
	const [indexText, glossaryText] = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		order,
		options
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

	const rawNorm = chosenFolder ? normalizePath(chosenFolder) : "";
	const normalizedChosenFolder = rawNorm === "/" || rawNorm === "." ? "" : rawNorm;
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


