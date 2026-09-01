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
		assert.ok(indexText.includes("- [[Alpha]]\n"));
		assert.ok(indexText.includes("- [[Beta]]\n"));
		assert.ok(indexText.includes("- [[Gamma]]\n"));
		assert.ok(glossaryText.includes("## Glossary\n"));

		const fullText = await createText(mockApp, FileType.Index, true);
		assert.ok(fullText.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n## Index\n"));
		assert.ok(!fullText.includes("## Glossary"));
	});

	it("creates glossary-only text correctly with proper headings and embeds", async () => {
		const fullText = await createText(mockApp, FileType.Glossary, true);
		assert.ok(fullText.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n## Glossary\n"));
		assert.ok(fullText.includes("### Alpha\n\n![[Alpha]]\n\n***\n\n"));
		assert.ok(fullText.includes("### Beta\n\n![[Beta]]\n\n***\n\n"));
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
		assert.ok(glossaryText.includes("### Alpha\n\n![[Alpha]]\n\n***\n\n"));

		const fullText = await createText(mockApp, FileType.GlossaryIndex, true);
		assert.ok(fullText.includes("## Index\n- [[#Alpha|Alpha]]\n- [[#Beta|Beta]]\n- [[#Gamma|Gamma]]\n"));
		assert.ok(fullText.includes("\n***\n\n## Glossary\n"));
	});

	it("filters notes within a chosenFolder", async () => {
		const [indexText] = await createArrays(
			mockApp,
			FileType.Index,
			true,
			undefined,
			"Folder"
		);

		assert.ok(indexText.includes("- [[Alpha]]\n"));
		assert.ok(indexText.includes("- [[Beta]]\n"));
		assert.ok(!indexText.includes("Gamma"));
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

		const gammaPos = indexText.indexOf("Gamma");
		const betaPos = indexText.indexOf("Beta");
		const alphaPos = indexText.indexOf("Alpha");

		assert.ok(gammaPos < betaPos && betaPos < alphaPos);
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
			makeTFile("Alpha", "Alpha.md"),
			makeTFile("Beta", "Beta.md"),
		]);
		mockVault.cachedRead.resolves("Content");

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
});
