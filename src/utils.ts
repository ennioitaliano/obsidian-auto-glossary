import { MetadataCacheWrapper, VaultWrapper } from "./interfaces/VaultWrapper";
import { normalizePath, TAbstractFile, TFile, TFolder } from "obsidian";

// Standard PascalCase enums with lowercase compatibility
export enum FileType {
	Index = "index",
	Glossary = "glossary",
	GlossaryIndex = "glossaryIndex",
}

export const fileType = {
	i: FileType.Index,
	g: FileType.Glossary,
	gi: FileType.GlossaryIndex,
} as const;
export type fileType = FileType;

export enum FileOrder {
	Default = "default",
	MtimeNew = "mtime_new",
	MtimeOld = "mtime_old",
	CtimeNew = "ctime_new",
	CtimeOld = "ctime_old",
	Alphabetical = "alphabetical",
	AlphabeticalRev = "alphabetical_rev",
}

export const fileOrder = {
	default: FileOrder.Default,
	mtime_new: FileOrder.MtimeNew,
	mtime_old: FileOrder.MtimeOld,
	ctime_new: FileOrder.CtimeNew,
	ctime_old: FileOrder.CtimeOld,
	alphabetical: FileOrder.Alphabetical,
	alphabetical_rev: FileOrder.AlphabeticalRev,
} as const;
export type fileOrder = FileOrder;

// Function to get the file type enum key from the string
export function getEnumFT(value?: string): FileType {
	if (!value) {
		return FileType.GlossaryIndex;
	}

	switch (value.toLowerCase()) {
		case "glossary":
			return FileType.Glossary;
		case "index":
			return FileType.Index;
		case "glossaryindex":
			return FileType.GlossaryIndex;
		default:
			return FileType.GlossaryIndex;
	}
}

// Function to get the file order enum key from the string
export function getEnumFO(value?: string): FileOrder {
	if (!value) {
		return FileOrder.Default;
	}

	switch (value.toLowerCase()) {
		case "mtime_new":
			return FileOrder.MtimeNew;
		case "mtime_old":
			return FileOrder.MtimeOld;
		case "ctime_new":
			return FileOrder.CtimeNew;
		case "ctime_old":
			return FileOrder.CtimeOld;
		case "alphabetical":
			return FileOrder.Alphabetical;
		case "alphabetical_rev":
			return FileOrder.AlphabeticalRev;
		case "default":
		default:
			return FileOrder.Default;
	}
}

// Function to format filenames based on a user-defined pattern
export function formatFileName(
	pattern: string | undefined,
	folderName: string,
	defaultFallback: string
): string {
	if (!pattern || pattern.trim() === "") {
		return defaultFallback;
	}

	const safeFolder = folderName.trim() || "Vault";
	return pattern
		.replace(/\{\{folder\}\}/gi, safeFolder)
		.replace(/\{\{name\}\}/gi, safeFolder)
		.trim();
}

export async function fileExists(
	vault: { getAbstractFileByPath: (path: string) => TAbstractFile | null },
	filePath: string
): Promise<boolean> {
	const normalized = filePath.endsWith(".md") ? filePath : `${filePath}.md`;
	return vault.getAbstractFileByPath(normalized) !== null;
}

export async function cleanFiles(
	vault: VaultWrapper,
	notesTFiles: TFile[],
	metadataCache?: MetadataCacheWrapper
): Promise<TFile[]> {
	const cleanedNotes: TFile[] = [];

	for (const file of notesTFiles) {
		try {
			if (metadataCache) {
				const cache = metadataCache.getFileCache(file);
				if (cache?.frontmatter) {
					const tags = cache.frontmatter.tags || cache.frontmatter.tag;
					if (
						(typeof tags === "string" && tags.includes("obsidian-auto-glossary")) ||
						(Array.isArray(tags) && tags.includes("obsidian-auto-glossary"))
					) {
						continue;
					}
				}
			}

			const fileContent: string = await vault.cachedRead(file);
			if (!fileContent.includes("obsidian-auto-glossary")) {
				cleanedNotes.push(file);
			}
		} catch {
			// If reading fails for a file, keep it in the list
			cleanedNotes.push(file);
		}
	}

	return cleanedNotes;
}

export function sortFiles(notesTFile: TFile[], order: FileOrder | string): TFile[] {
	if (!notesTFile || !Array.isArray(notesTFile)) {
		throw new Error("Invalid file list provided to sortFiles");
	}

	switch (order) {
		case FileOrder.CtimeNew:
			notesTFile.sort((a, b) => (b.stat?.ctime ?? 0) - (a.stat?.ctime ?? 0));
			break;
		case FileOrder.CtimeOld:
			notesTFile.sort((a, b) => (a.stat?.ctime ?? 0) - (b.stat?.ctime ?? 0));
			break;
		case FileOrder.MtimeNew:
			notesTFile.sort((a, b) => (b.stat?.mtime ?? 0) - (a.stat?.mtime ?? 0));
			break;
		case FileOrder.MtimeOld:
			notesTFile.sort((a, b) => (a.stat?.mtime ?? 0) - (b.stat?.mtime ?? 0));
			break;
		case FileOrder.Alphabetical:
			notesTFile.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
			break;
		case FileOrder.AlphabeticalRev:
			notesTFile.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base", numeric: true }));
			break;
		case FileOrder.Default:
		default:
			break;
	}

	return notesTFile;
}

export async function ensureFolderExists(
	vault: { getAbstractFileByPath: (path: string) => TAbstractFile | null; createFolder: (path: string) => Promise<TFolder> },
	folderPath: string
): Promise<void> {
	const normalized = normalizePath(folderPath).trim();
	if (!normalized || normalized === "/" || normalized === ".") {
		return;
	}

	const parts = normalized.split("/").filter((part) => part.length > 0);
	let currentPath = "";

	for (const part of parts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part;
		const existing = vault.getAbstractFileByPath(currentPath);
		if (!existing) {
			try {
				await vault.createFolder(currentPath);
			} catch (error) {
				if (!vault.getAbstractFileByPath(currentPath)) {
					throw error;
				}
			}
		}
	}
}

export interface TemplateData {
	title?: string;
	folder?: string;
	folderPath?: string;
	indexContent?: string;
	glossaryContent?: string;
	content?: string;
	date?: string;
	time?: string;
}

export function formatCurrentDate(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatCurrentTime(date: Date = new Date()): string {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

export function splitFrontmatter(markdown: string): {
	frontmatter: string | null;
	body: string;
} {
	const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (match) {
		return {
			frontmatter: match[1],
			body: markdown.slice(match[0].length),
		};
	}
	return {
		frontmatter: null,
		body: markdown,
	};
}

export function ensureAutoGlossaryTag(markdown: string): string {
	const { frontmatter, body } = splitFrontmatter(markdown);
	const requiredTag = "obsidian-auto-glossary";

	if (frontmatter === null) {
		return `---\ntags:\n  - ${requiredTag}\n---\n${markdown}`;
	}

	if (frontmatter.includes(requiredTag)) {
		return markdown;
	}

	// If tags property exists in frontmatter
	const tagListMatch = frontmatter.match(/^(tags|tag):\s*(\[[^\]]*\])?(.*)$/m);
	if (tagListMatch) {
		const fullLine = tagListMatch[0];
		const bracketContent = tagListMatch[2];

		let updatedFrontmatter = frontmatter;
		if (bracketContent) {
			// e.g. tags: [foo, bar]
			const inside = bracketContent.slice(1, -1).trim();
			const newInside = inside ? `${inside}, ${requiredTag}` : requiredTag;
			updatedFrontmatter = frontmatter.replace(fullLine, `${tagListMatch[1]}: [${newInside}]`);
		} else {
			// e.g. tags:\n  - foo
			updatedFrontmatter = frontmatter.replace(
				fullLine,
				`${fullLine}\n  - ${requiredTag}`
			);
		}
		return `---\n${updatedFrontmatter}\n---\n${body}`;
	}

	// No tags property in frontmatter, append tags to frontmatter
	const trimmedFm = frontmatter.trimEnd();
	const newFm = trimmedFm ? `${trimmedFm}\ntags:\n  - ${requiredTag}` : `tags:\n  - ${requiredTag}`;
	return `---\n${newFm}\n---\n${body}`;
}

export function parseFrontmatterBlocks(frontmatterText: string): Map<string, string> {
	const blocks = new Map<string, string>();
	const lines = frontmatterText.split(/\r?\n/);
	let currentKey: string | null = null;
	let currentLines: string[] = [];

	for (const line of lines) {
		const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (keyMatch) {
			if (currentKey) {
				blocks.set(currentKey, currentLines.join("\n"));
			}
			currentKey = keyMatch[1];
			currentLines = [line];
		} else if (currentKey) {
			currentLines.push(line);
		}
	}

	if (currentKey) {
		blocks.set(currentKey, currentLines.join("\n"));
	}

	return blocks;
}

export function extractTagsFromBlock(blockText: string): string[] {
	const tags: string[] = [];
	const lines = blockText.split(/\r?\n/);
	for (const line of lines) {
		const bracketMatch = line.match(/^(?:tags|tag):\s*\[(.*?)\]/);
		if (bracketMatch) {
			const items = bracketMatch[1].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
			tags.push(...items);
			continue;
		}
		const listMatch = line.match(/^\s*-\s+(.+)$/);
		if (listMatch) {
			tags.push(listMatch[1].trim().replace(/^['"]|['"]$/g, ""));
			continue;
		}
		const scalarMatch = line.match(/^(?:tags|tag):\s*([^[\s].*)$/);
		if (scalarMatch) {
			tags.push(scalarMatch[1].trim().replace(/^['"]|['"]$/g, ""));
		}
	}
	return Array.from(new Set(tags));
}

export function mergeFrontmatter(existingMarkdown: string, newMarkdown: string): string {
	const existingSplit = splitFrontmatter(existingMarkdown);
	const newSplit = splitFrontmatter(newMarkdown);

	if (!existingSplit.frontmatter) {
		return ensureAutoGlossaryTag(newMarkdown);
	}

	if (!newSplit.frontmatter) {
		const merged = `---\n${existingSplit.frontmatter}\n---\n${newSplit.body}`;
		return ensureAutoGlossaryTag(merged);
	}

	const existingBlocks = parseFrontmatterBlocks(existingSplit.frontmatter);
	const newBlocks = parseFrontmatterBlocks(newSplit.frontmatter);

	// Extract tags from both and combine
	const existingTags = existingBlocks.has("tags")
		? extractTagsFromBlock(existingBlocks.get("tags")!)
		: existingBlocks.has("tag")
		? extractTagsFromBlock(existingBlocks.get("tag")!)
		: [];

	const newTags = newBlocks.has("tags")
		? extractTagsFromBlock(newBlocks.get("tags")!)
		: newBlocks.has("tag")
		? extractTagsFromBlock(newBlocks.get("tag")!)
		: [];

	const combinedTags = Array.from(new Set([...existingTags, ...newTags, "obsidian-auto-glossary"]));

	const resultBlocks: string[] = [];

	// Use new blocks first, preserving their order
	for (const [key, block] of newBlocks.entries()) {
		if (key === "tags" || key === "tag") {
			resultBlocks.push(`tags:\n${combinedTags.map((t) => `  - ${t}`).join("\n")}`);
		} else {
			resultBlocks.push(block);
		}
	}

	if (!newBlocks.has("tags") && !newBlocks.has("tag")) {
		resultBlocks.push(`tags:\n${combinedTags.map((t) => `  - ${t}`).join("\n")}`);
	}

	// Add any keys from existing blocks that are not in new blocks
	for (const [key, block] of existingBlocks.entries()) {
		if (key !== "tags" && key !== "tag" && !newBlocks.has(key)) {
			resultBlocks.push(block);
		}
	}

	const mergedFrontmatter = resultBlocks.join("\n");
	return `---\n${mergedFrontmatter}\n---\n${newSplit.body}`;
}

export function applyTemplate(templateContent: string, data: TemplateData): string {
	const safeFolder = data.folder?.trim() || "Vault";
	const safeTitle = data.title?.trim() || "";
	const safeFolderPath = data.folderPath?.trim() || "";
	const safeDate = data.date || formatCurrentDate();
	const safeTime = data.time || formatCurrentTime();
	const indexText = data.indexContent || "";
	const glossaryText = data.glossaryContent || "";
	const contentText = data.content !== undefined ? data.content : `${indexText}\n***\n\n${glossaryText}`;

	let result = templateContent
		.replace(/\{\{folder\}\}/gi, safeFolder)
		.replace(/\{\{name\}\}/gi, safeFolder)
		.replace(/\{\{folderPath\}\}/gi, safeFolderPath)
		.replace(/\{\{folder_path\}\}/gi, safeFolderPath)
		.replace(/\{\{title\}\}/gi, safeTitle)
		.replace(/\{\{date\}\}/gi, safeDate)
		.replace(/\{\{time\}\}/gi, safeTime);

	const hasContentPlaceholder = /\{\{content\}\}/i.test(result);
	const hasIndexPlaceholder = /\{\{index\}\}/i.test(result);
	const hasGlossaryPlaceholder = /\{\{glossary\}\}/i.test(result);

	if (hasContentPlaceholder) {
		result = result.replace(/\{\{content\}\}/gi, contentText);
	}
	if (hasIndexPlaceholder) {
		result = result.replace(/\{\{index\}\}/gi, indexText);
	}
	if (hasGlossaryPlaceholder) {
		result = result.replace(/\{\{glossary\}\}/gi, glossaryText);
	}

	// If none of the content placeholders were in the template, append content
	if (!hasContentPlaceholder && !hasIndexPlaceholder && !hasGlossaryPlaceholder) {
		const trimmed = result.trimEnd();
		result = trimmed ? `${trimmed}\n\n${contentText}` : contentText;
	}

	return ensureAutoGlossaryTag(result);
}

