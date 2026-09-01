import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { App, TAbstractFile, TFile, TFolder } from "obsidian";
import { createStubInstance, SinonStubbedInstance } from "sinon";
import { VaultMock } from "./mocks/VaultMock";
import { createArrays, createFile, createText } from "../src/glossaryIndex";
import { FileOrder, FileType } from "../src/utils";

const makeTFile = (basename: string, path: string): TFile => {
	const file = new (TFile as unknown as { new (): TFile })();
	Object.assign(file, {
		basename,
		extension: "md",
		stat: { ctime: 1, mtime: 1, size: 10 },
		vault: {},
		path,
		name: `${basename}.md`,
		parent: null,
	});
	return file;
};

const makeTFolder = (path: string): TFolder => {
	const folder = new (TFolder as unknown as { new (): TFolder })();
	Object.assign(folder, {
		path,
		name: path.split("/").pop() || "Folder",
		parent: null,
		children: [],
	});
	return folder;
};

describe("glossaryIndex - createArrays & createText", () => {
	let mockVault: SinonStubbedInstance<VaultMock>;
	let mockApp: App;
	let testFiles: TFile[];

	beforeEach(() => {
		mockVault = createStubInstance(VaultMock);
		testFiles = [
			makeTFile("Alpha", "Folder/Alpha.md"),
			makeTFile("Beta", "Folder/Beta.md"),
			makeTFile("Gamma", "OtherFolder/Gamma.md"),
		];

		mockVault.getMarkdownFiles.returns(testFiles);
		mockVault.cachedRead.resolves("Note content without auto-glossary tag");

		mockApp = {
			vault: mockVault,
			metadataCache: {
				getFileCache: () => null,
			},
		} as unknown as App;
	});

	it("creates index-only text correctly", async () => {
		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.Index,
			true
		);

		assert.ok(indexText.includes("## Index\n"));
		assert.ok(indexText.includes("### Folder\n\n- [[Alpha]]\n- [[Beta]]\n"));
		assert.ok(indexText.includes("### OtherFolder\n\n- [[Gamma]]\n"));
		assert.ok(glossaryText.includes("## Glossary\n"));

		const fullText = await createText(mockApp, FileType.Index, true);
		assert.ok(fullText.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n## Index\n"));
		assert.ok(!fullText.includes("## Glossary"));
	});

	it("creates glossary-only text correctly with proper headings and embeds", async () => {
		const fullText = await createText(mockApp, FileType.Glossary, true);
		assert.ok(fullText.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n## Glossary\n"));
		assert.ok(fullText.includes("### Folder\n\n#### Alpha\n\n![[Alpha]]\n\n***\n\n#### Beta\n\n![[Beta]]\n\n***\n\n"));
		assert.ok(fullText.includes("### OtherFolder\n\n#### Gamma\n\n![[Gamma]]\n\n***\n\n"));
		assert.ok(!fullText.includes("## Index"));
	});

	it("creates combined glossary index with working heading anchors", async () => {
		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.GlossaryIndex,
			true
		);

		assert.ok(indexText.includes("- [[#Alpha|Alpha]]\n"));
		assert.ok(indexText.includes("- [[#Beta|Beta]]\n"));
		assert.ok(glossaryText.includes("#### Alpha\n\n![[Alpha]]\n\n***\n\n"));

		const fullText = await createText(mockApp, FileType.GlossaryIndex, true);
		assert.ok(fullText.includes("## Index\n\n### Folder\n\n- [[#Alpha|Alpha]]\n- [[#Beta|Beta]]\n"));
		assert.ok(fullText.includes("\n***\n\n## Glossary\n"));
	});

	it("filters notes within a chosenFolder and lists direct notes without extra heading", async () => {
		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"Folder"
		);

		assert.ok(indexText.includes("## Index\n- [[Alpha]]\n- [[Beta]]\n"));
		assert.ok(!indexText.includes("Gamma"));
		assert.ok(glossaryText.includes("### Alpha\n\n![[Alpha]]\n\n***\n\n### Beta\n\n![[Beta]]\n\n***\n\n"));
	});

	it("sorts notes correctly in created arrays", async () => {
		const [indexText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			undefined,
			FileOrder.AlphabeticalRev
		);

		const otherPos = indexText.indexOf("OtherFolder");
		const folderPos = indexText.indexOf("### Folder");

		assert.ok(otherPos < folderPos);
	});

	it("supports disabling subfolders (includeSubfolders: false)", async () => {
		const rootFiles = [
			makeTFile("RootNote", "RootNote.md"),
			makeTFile("Alpha", "Folder/Alpha.md"),
		];
		mockVault.getMarkdownFiles.returns(rootFiles);

		const [indexText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"",
			FileOrder.Default,
			{ includeSubfolders: false }
		);

		assert.ok(indexText.includes("- [[RootNote]]\n"));
		assert.ok(!indexText.includes("Alpha"));
		assert.ok(!indexText.includes("### Folder"));
	});

	it("supports non-markdown file inclusion and whitelist filtering", async () => {
		const mixedFiles = [
			makeTFile("Alpha", "Alpha.md"),
			Object.assign(makeTFile("photo", "photo.png"), { extension: "png", name: "photo.png" }),
			Object.assign(makeTFile("doc", "doc.pdf"), { extension: "pdf", name: "doc.pdf" }),
			Object.assign(makeTFile("archive", "archive.zip"), { extension: "zip", name: "archive.zip" }),
		];
		mockVault.getFiles.returns(mixedFiles);

		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"",
			FileOrder.Default,
			{
				includeNonMarkdown: true,
				nonMarkdownExtensions: "png, pdf",
			}
		);

		assert.ok(indexText.includes("- [[Alpha]]\n"));
		assert.ok(indexText.includes("- [[photo.png]]\n"));
		assert.ok(indexText.includes("- [[doc.pdf]]\n"));
		assert.ok(!indexText.includes("archive.zip"));

		assert.ok(glossaryText.includes("### photo.png\n\n![[photo.png]]\n\n***\n\n"));
		assert.ok(glossaryText.includes("### doc.pdf\n\n![[doc.pdf]]\n\n***\n\n"));
	});

	it("handles empty folder inclusion and omission in glossary", async () => {
		const files = [makeTFile("Alpha", "Folder/Alpha.md")];
		mockVault.getMarkdownFiles.returns(files);
		mockVault.getAllLoadedFiles.returns([
			makeTFolder("Folder"),
			makeTFolder("EmptyFolder"),
		]);

		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"",
			FileOrder.Default,
			{
				includeSubfolders: true,
				includeEmptyFolders: true,
			}
		);

		assert.ok(indexText.includes("- EmptyFolder/\n"));
		assert.ok(!glossaryText.includes("EmptyFolder"));
	});

	it("supports excludedTags filtering in createArrays", async () => {
		(mockApp as any).metadataCache = {
			getFileCache: (file: TFile) => {
				if (file.name === "Beta.md") {
					return { frontmatter: { tags: ["draft"] } };
				}
				return null;
			},
		};

		const [indexText, glossaryText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"",
			FileOrder.Default,
			{
				excludedTags: "draft",
			}
		);

		assert.ok(indexText.includes("- [[Alpha]]"));
		assert.ok(!indexText.includes("Beta"));
	});
});

describe("glossaryIndex - createFile", () => {
	let mockVault: SinonStubbedInstance<VaultMock>;
	let mockApp: App;
	let createdFiles: Map<string, string>;

	beforeEach(() => {
		mockVault = createStubInstance(VaultMock);
		createdFiles = new Map<string, string>();

		mockVault.getMarkdownFiles.returns([
			makeTFile("Alpha", "Folder/Alpha.md"),
			makeTFile("Beta", "Folder/Beta.md"),
		]);
		mockVault.cachedRead.callsFake(async (file: TFile): Promise<string> => {
			return createdFiles.get(file.path) ?? "Content";
		});

		mockVault.getAbstractFileByPath.callsFake((path: string): TAbstractFile | null => {
			if (createdFiles.has(path)) {
				const file = makeTFile(path.replace(/\.md$/, ""), path);
				return file;
			}
			return null;
		});

		mockVault.create.callsFake(async (path: string, data: string): Promise<TFile> => {
			createdFiles.set(path, data);
			return makeTFile(path.replace(/\.md$/, ""), path);
		});

		mockVault.modify.callsFake(async (file: TFile, data: string): Promise<void> => {
			createdFiles.set(file.path, data);
		});

		mockVault.createFolder.callsFake(async (path: string): Promise<TFolder> => {
			return new (TFolder as unknown as { new (): TFolder })();
		});

		mockApp = {
			vault: mockVault,
			metadataCache: {
				getFileCache: () => null,
			},
		} as unknown as App;
	});

	it("creates a new file in destination folder", async () => {
		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			false,
			"MyIndex",
			"SourceFolder",
			FileOrder.Default,
			"DestFolder"
		);

		assert.ok(result);
		assert.equal(mockVault.create.callCount, 1);
		assert.equal(mockVault.create.firstCall.args[0], "DestFolder/MyIndex.md");
	});

	it("updates an existing file when overwrite is true", async () => {
		createdFiles.set("Existing.md", "Old content");

		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			true,
			"Existing",
			"",
			FileOrder.Default
		);

		assert.ok(result);
		assert.equal(mockVault.modify.callCount, 1);
		assert.equal(mockVault.create.callCount, 0);
	});

	it("refuses to overwrite an existing file when overwrite is false", async () => {
		createdFiles.set("Existing.md", "Old content");

		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			false,
			"Existing",
			"",
			FileOrder.Default
		);

		assert.equal(result, null);
		assert.equal(mockVault.modify.callCount, 0);
		assert.equal(mockVault.create.callCount, 0);
	});

	it("creates a file using a custom template", async () => {
		createdFiles.set(
			"Templates/CustomIndex.md",
			"---\naliases: [{{folder}} Index]\n---\n# {{folder}} MOC\n\n{{content}}"
		);

		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			false,
			"Folder_Index",
			"Folder",
			FileOrder.Default,
			"",
			"Templates/CustomIndex"
		);

		assert.ok(result);
		assert.equal(mockVault.create.callCount, 1);
		const content = createdFiles.get("Folder/Folder_Index.md");
		assert.ok(content);
		assert.ok(content.includes("aliases: [Folder Index]"));
		assert.ok(content.includes("# Folder MOC"));
		assert.ok(content.includes("## Index\n- [[Alpha]]\n- [[Beta]]"));
		assert.ok(content.includes("obsidian-auto-glossary"));
	});

	it("falls back to default format when template path does not exist", async () => {
		const text = await createText(
			mockApp,
			FileType.Index,
			true,
			"Folder_Index",
			"Folder",
			FileOrder.Default,
			"NonExistentTemplate.md"
		);

		assert.ok(text.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n## Index\n"));
	});

	it("preserves custom user frontmatter metadata when overwriting", async () => {
		createdFiles.set(
			"Folder/Existing.md",
			"---\naliases:\n  - My Custom Alias\nrating: 5\ntags:\n  - custom-tag\n  - obsidian-auto-glossary\n---\n## Index\n- [[Alpha]]"
		);

		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			true,
			"Existing",
			"Folder",
			FileOrder.Default
		);

		assert.ok(result);
		assert.equal(mockVault.modify.callCount, 1);
		const updatedContent = createdFiles.get("Folder/Existing.md");
		assert.ok(updatedContent);
		assert.ok(updatedContent.includes("aliases:\n  - My Custom Alias"));
		assert.ok(updatedContent.includes("rating: 5"));
		assert.ok(updatedContent.includes("custom-tag"));
		assert.ok(updatedContent.includes("obsidian-auto-glossary"));
		assert.ok(updatedContent.includes("## Index\n- [[Alpha]]\n- [[Beta]]"));
	});

	it("creates a file respecting excludedTags option", async () => {
		(mockApp as any).metadataCache = {
			getFileCache: (file: TFile) => {
				if (file.name === "Beta.md") {
					return { frontmatter: { tags: ["archived_project"] } };
				}
				return null;
			},
		};

		const result = await createFile(
			mockApp,
			FileType.Index,
			true,
			false,
			"FilteredIndex",
			"Folder",
			FileOrder.Default,
			"",
			"",
			{
				excludedTags: "archived_project",
			}
		);

		assert.ok(result);
		assert.equal(mockVault.create.callCount, 1);
		const content = createdFiles.get("Folder/FilteredIndex.md");
		assert.ok(content);
		assert.ok(content.includes("- [[Alpha]]"));
		assert.ok(!content.includes("Beta"));
	});
});
