import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { TFile, FileStats, TFolder, TAbstractFile } from "obsidian";
import { cloneDeep } from "lodash";

import * as utils from "../src/utils";
import { createStubInstance, SinonStubbedInstance } from "sinon";
import { VaultMock } from "./mocks/VaultMock";

/*********************
 *       UTILS       *
 *********************/
export const createTFile = (fileNum: number, name: string, stat: FileStats, path = "testPath"): TFile => {
	const file = new (TFile as unknown as { new (): TFile })();
	Object.assign(file, {
		basename: `testFile${fileNum}`,
		extension: "md",
		stat,
		vault: {},
		path,
		name: name,
		parent: null,
	});
	return file;
};

/*********************
 *     CONSTANTS     *
 *********************/
const TEST_FILENAME: Array<string> = ["testFile1", "testFile3", "testFile2", "testFile3"];
const TEST_FILES: TFile[] = [
	createTFile(1, TEST_FILENAME[0], {
		ctime: 5,
		mtime: 10,
		size: 50,
	}),
	createTFile(2, TEST_FILENAME[1], {
		ctime: 10,
		mtime: 5,
		size: 8,
	}),
	createTFile(3, TEST_FILENAME[2], {
		ctime: 7,
		mtime: 10,
		size: 1,
	}),
	createTFile(4, TEST_FILENAME[3], {
		ctime: 15,
		mtime: 15,
		size: 15,
	}),
];

describe("getEnumFT", () => {
	it("successfully returns the correct file type", () => {
		assert.equal(utils.getEnumFT("glossary"), utils.FileType.Glossary);
		assert.equal(utils.getEnumFT("index"), utils.FileType.Index);
		assert.equal(utils.getEnumFT("glossaryIndex"), utils.FileType.GlossaryIndex);
		assert.equal(utils.getEnumFT("default"), utils.FileType.GlossaryIndex);
		assert.equal(utils.getEnumFT(""), utils.FileType.GlossaryIndex);
		assert.equal(utils.getEnumFT(undefined), utils.FileType.GlossaryIndex);
	});
});

describe("getEnumFO", () => {
	it("successfully returns the file order enum key", () => {
		assert.equal(utils.getEnumFO(""), utils.FileOrder.Default);
		assert.equal(utils.getEnumFO(undefined), utils.FileOrder.Default);
		assert.equal(utils.getEnumFO("default"), utils.FileOrder.Default);
		assert.equal(utils.getEnumFO("anyOtherStringInput"), utils.FileOrder.Default);
		assert.equal(utils.getEnumFO("mtime_new"), utils.FileOrder.MtimeNew);
		assert.equal(utils.getEnumFO("mtime_old"), utils.FileOrder.MtimeOld);
		assert.equal(utils.getEnumFO("ctime_new"), utils.FileOrder.CtimeNew);
		assert.equal(utils.getEnumFO("ctime_old"), utils.FileOrder.CtimeOld);
		assert.equal(utils.getEnumFO("alphabetical"), utils.FileOrder.Alphabetical);
		assert.equal(utils.getEnumFO("alphabetical_rev"), utils.FileOrder.AlphabeticalRev);
	});
});

describe("formatFileName", () => {
	it("interpolates {{folder}} placeholder correctly", () => {
		assert.equal(
			utils.formatFileName("{{folder}}_Index", "Notes", "Notes_Index"),
			"Notes_Index"
		);
		assert.equal(
			utils.formatFileName("+{{folder}}_Index", "Projects", "Projects_Index"),
			"+Projects_Index"
		);
		assert.equal(
			utils.formatFileName("-{{folder}}_Glossary", "Archive", "Archive_Glossary"),
			"-Archive_Glossary"
		);
		assert.equal(
			utils.formatFileName("{{folder}} MOC", "Books", "Books_Index"),
			"Books MOC"
		);
	});

	it("interpolates {{name}} alias placeholder correctly", () => {
		assert.equal(
			utils.formatFileName("{{name}}_GlossaryIndex", "Docs", "Docs_GlossaryIndex"),
			"Docs_GlossaryIndex"
		);
	});

	it("handles case-insensitive placeholders", () => {
		assert.equal(
			utils.formatFileName("{{FOLDER}}_Index", "Docs", "Docs_Index"),
			"Docs_Index"
		);
		assert.equal(
			utils.formatFileName("{{Folder}}_Index", "Docs", "Docs_Index"),
			"Docs_Index"
		);
	});

	it("falls back to defaultFallback when pattern is empty or whitespace", () => {
		assert.equal(
			utils.formatFileName("", "Notes", "Notes_Index"),
			"Notes_Index"
		);
		assert.equal(
			utils.formatFileName("   ", "Notes", "Notes_Index"),
			"Notes_Index"
		);
		assert.equal(
			utils.formatFileName(undefined, "Notes", "Notes_Index"),
			"Notes_Index"
		);
	});

	it("falls back to 'Vault' when folderName is empty", () => {
		assert.equal(
			utils.formatFileName("+{{folder}}_Index", "", "Vault_Index"),
			"+Vault_Index"
		);
		assert.equal(
			utils.formatFileName("{{folder}}_Index", "   ", "Vault_Index"),
			"Vault_Index"
		);
	});
});

describe("sortFiles", () => {
	let testFiles: Array<TFile>;
	let testFilenames: Array<string>;

	beforeEach(() => {
		testFiles = cloneDeep(TEST_FILES);
		testFilenames = cloneDeep(TEST_FILENAME);
	});

	it(`sorts ${utils.FileOrder.CtimeNew} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.CtimeNew);

		assert.equal(testFiles.length, 4);

		const expectedCTimes: Array<number> = [15, 10, 7, 5];
		for (let i = 0; i < expectedCTimes.length; i++) {
			assert.equal(testFiles[i].stat.ctime, expectedCTimes[i]);
		}
	});

	it(`sorts by ${utils.FileOrder.CtimeOld} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.CtimeOld);

		assert.equal(testFiles.length, 4);

		const expectedCTimes: Array<number> = [5, 7, 10, 15];
		for (let i = 0; i < expectedCTimes.length; i++) {
			assert.equal(testFiles[i].stat.ctime, expectedCTimes[i]);
		}
	});

	it(`sorts by ${utils.FileOrder.Alphabetical} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.Alphabetical);

		assert.equal(testFiles.length, 4);

		const expectedFilenameSort = testFilenames.sort();
		for (let i = 0; i < expectedFilenameSort.length; i++) {
			assert.equal(testFiles[i].name, expectedFilenameSort[i]);
		}
	});

	it(`sorts by ${utils.FileOrder.AlphabeticalRev} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.AlphabeticalRev);

		assert.equal(testFiles.length, 4);

		const expectedFilenameSort = testFilenames.sort().reverse();
		for (let i = 0; i < expectedFilenameSort.length; i++) {
			assert.equal(testFiles[i].name, expectedFilenameSort[i]);
		}
	});

	it("sorts alphabetically with natural numbers correctly (numeric sort)", () => {
		const filesWithNumbers = [
			createTFile(1, "Chapter 10", { ctime: 1, mtime: 1, size: 1 }),
			createTFile(2, "Chapter 2", { ctime: 2, mtime: 2, size: 2 }),
			createTFile(3, "Chapter 1", { ctime: 3, mtime: 3, size: 3 }),
		];

		utils.sortFiles(filesWithNumbers, utils.FileOrder.Alphabetical);

		assert.equal(filesWithNumbers[0].name, "Chapter 1");
		assert.equal(filesWithNumbers[1].name, "Chapter 2");
		assert.equal(filesWithNumbers[2].name, "Chapter 10");
	});

	it(`sorts by ${utils.FileOrder.MtimeNew} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.MtimeNew);

		assert.equal(testFiles.length, 4);

		const expectedMTimes = [15, 10, 10, 5];
		for (let i = 0; i < expectedMTimes.length; i++) {
			assert.equal(testFiles[i].stat.mtime, expectedMTimes[i]);
		}
	});

	it(`sorts by ${utils.FileOrder.MtimeOld} files correctly`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.MtimeOld);

		assert.equal(testFiles.length, 4);

		const expectedMTimes = [5, 10, 10, 15];
		for (let i = 0; i < expectedMTimes.length; i++) {
			assert.equal(testFiles[i].stat.mtime, expectedMTimes[i]);
		}
	});

	it(`${utils.FileOrder.Default} does not sort files`, () => {
		utils.sortFiles(testFiles, utils.FileOrder.Default);

		assert.equal(testFiles.length, 4);

		for (let i = 0; i < testFiles.length; i++) {
			assert.equal(testFiles[i].basename, TEST_FILES[i].basename);
		}
	});

	it("Unrecognized file order does not sort files", () => {
		utils.sortFiles(testFiles, "unknown");

		assert.equal(testFiles.length, 4);

		for (let i = 0; i < testFiles.length; i++) {
			assert.equal(testFiles[i].basename, TEST_FILES[i].basename);
		}
	});

	it("should throw on undefined file list", () => {
		assert.throws(() => utils.sortFiles(null as unknown as TFile[], utils.FileOrder.CtimeNew));
	});
});

describe("fileExists", () => {
	const filename = "testFile.txt";

	it("successfully checks that a file exists", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		const dummyFile = new (TFile as unknown as { new (): TFile })();
		mockVault.getAbstractFileByPath.returns(dummyFile);
		const exists: boolean = await utils.fileExists(mockVault, filename);

		assert.equal(mockVault.getAbstractFileByPath.callCount, 1);
		assert.equal(exists, true);
	});

	it("successfully checks that a file doesn't exist", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		mockVault.getAbstractFileByPath.returns(null);
		const exists: boolean = await utils.fileExists(mockVault, filename);

		assert.equal(mockVault.getAbstractFileByPath.callCount, 1);
		assert.equal(exists, false);
	});
});

describe("cleanFiles", () => {
	let testFiles: Array<TFile>;

	beforeEach(() => {
		testFiles = cloneDeep(TEST_FILES);
	});

	it("successfully cleans file", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		mockVault.cachedRead.resolves("No matching string");

		const cleanedFiles: Array<TFile> = await utils.cleanFiles(mockVault, testFiles);

		assert.equal(mockVault.cachedRead.callCount, testFiles.length);
		for (let fileIdx = 0; fileIdx < testFiles.length; fileIdx++) {
			assert.equal(cleanedFiles[fileIdx], testFiles[fileIdx]);
		}
	});

	it("avoids cleaning obsidian glossary files via cached content", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		mockVault.cachedRead.resolves("---\ntags: obsidian-auto-glossary\n---\n");

		const cleanedFiles: Array<TFile> = await utils.cleanFiles(mockVault, testFiles);

		assert.equal(mockVault.cachedRead.callCount, testFiles.length);
		assert.equal(cleanedFiles.length, 0);
	});

	it("avoids cleaning obsidian glossary files via metadata cache without reading file", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		const mockMetadataCache = {
			getFileCache: () => ({
				frontmatter: {
					tags: ["obsidian-auto-glossary"],
				},
			}),
		};

		const cleanedFiles: Array<TFile> = await utils.cleanFiles(
			mockVault,
			testFiles,
			mockMetadataCache
		);

		assert.equal(mockVault.cachedRead.callCount, 0);
		assert.equal(cleanedFiles.length, 0);
	});
});

describe("ensureFolderExists", () => {
	it("does nothing for empty or root paths", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		await utils.ensureFolderExists(mockVault, "");
		await utils.ensureFolderExists(mockVault, "/");
		assert.equal(mockVault.createFolder.callCount, 0);
	});

	it("recursively creates missing folders in a path", async () => {
		const mockVault: SinonStubbedInstance<VaultMock> = createStubInstance(VaultMock);
		const createdPaths: string[] = [];

		mockVault.getAbstractFileByPath.callsFake((path: string): TAbstractFile | null => {
			return createdPaths.includes(path)
				? new (TFolder as unknown as { new (): TFolder })()
				: null;
		});

		mockVault.createFolder.callsFake(async (path: string): Promise<TFolder> => {
			createdPaths.push(path);
			return new (TFolder as unknown as { new (): TFolder })();
		});

		await utils.ensureFolderExists(mockVault, "Parent/Child/Grandchild");

		assert.deepEqual(createdPaths, [
			"Parent",
			"Parent/Child",
			"Parent/Child/Grandchild",
		]);
	});
});

describe("template & frontmatter utilities", () => {
	it("formatCurrentDate formats Date as YYYY-MM-DD", () => {
		const fixedDate = new Date(2026, 4, 15);
		assert.equal(utils.formatCurrentDate(fixedDate), "2026-05-15");
	});

	it("formatCurrentTime formats Date as HH:mm", () => {
		const fixedDate = new Date(2026, 4, 15, 9, 7);
		assert.equal(utils.formatCurrentTime(fixedDate), "09:07");
	});

	it("splitFrontmatter correctly splits frontmatter and body", () => {
		const mdWithFm = "---\naliases: [Index]\n---\n# Title\nBody";
		const res = utils.splitFrontmatter(mdWithFm);
		assert.equal(res.frontmatter, "aliases: [Index]");
		assert.equal(res.body, "# Title\nBody");

		const mdWithoutFm = "# Title\nBody";
		const res2 = utils.splitFrontmatter(mdWithoutFm);
		assert.equal(res2.frontmatter, null);
		assert.equal(res2.body, "# Title\nBody");
	});

	it("ensureAutoGlossaryTag adds frontmatter if none exists", () => {
		const md = "# Title\nContent";
		const res = utils.ensureAutoGlossaryTag(md);
		assert.ok(res.startsWith("---\ntags:\n  - obsidian-auto-glossary\n---\n"));
		assert.ok(res.includes("# Title\nContent"));
	});

	it("ensureAutoGlossaryTag preserves existing tag array and adds obsidian-auto-glossary", () => {
		const md = "---\ntags:\n  - my-tag\n---\n# Title";
		const res = utils.ensureAutoGlossaryTag(md);
		assert.ok(res.includes("  - my-tag"));
		assert.ok(res.includes("  - obsidian-auto-glossary"));
	});

	it("ensureAutoGlossaryTag preserves bracket tags and adds obsidian-auto-glossary", () => {
		const md = "---\ntags: [tag1, tag2]\n---\n# Title";
		const res = utils.ensureAutoGlossaryTag(md);
		assert.ok(res.includes("tags: [tag1, tag2, obsidian-auto-glossary]"));
	});

	it("ensureAutoGlossaryTag does not duplicate tag if already present", () => {
		const md = "---\ntags:\n  - obsidian-auto-glossary\n---\n# Title";
		const res = utils.ensureAutoGlossaryTag(md);
		assert.equal(res, md);
	});

	it("mergeFrontmatter preserves custom user metadata when refreshed", () => {
		const existingFile = "---\naliases:\n  - Custom MOC\nstatus: active\ntags:\n  - custom-tag\n  - obsidian-auto-glossary\n---\nOld content";
		const newFile = "---\ntags:\n  - obsidian-auto-glossary\n---\n## Index\n- [[Note1]]";

		const merged = utils.mergeFrontmatter(existingFile, newFile);
		assert.ok(merged.includes("aliases:\n  - Custom MOC"));
		assert.ok(merged.includes("status: active"));
		assert.ok(merged.includes("custom-tag"));
		assert.ok(merged.includes("obsidian-auto-glossary"));
		assert.ok(merged.includes("## Index\n- [[Note1]]"));
		assert.ok(!merged.includes("Old content"));
	});

	it("applyTemplate replaces all placeholders correctly", () => {
		const template = [
			"---",
			"aliases:",
			'  - "{{folder}} Overview"',
			"---",
			"# {{title}}",
			"Folder: {{folder}} at {{folderPath}}",
			"Generated on {{date}} at {{time}}",
			"",
			"{{content}}",
		].join("\n");

		const result = utils.applyTemplate(template, {
			title: "Projects_Index",
			folder: "Projects",
			folderPath: "Work/Projects",
			date: "2026-09-01",
			time: "12:00",
			content: "## Index\n- [[ProjA]]",
		});

		assert.ok(result.includes('aliases:\n  - "Projects Overview"'));
		assert.ok(result.includes("# Projects_Index"));
		assert.ok(result.includes("Folder: Projects at Work/Projects"));
		assert.ok(result.includes("Generated on 2026-09-01 at 12:00"));
		assert.ok(result.includes("## Index\n- [[ProjA]]"));
		assert.ok(result.includes("obsidian-auto-glossary"));
	});

	it("applyTemplate replaces index and glossary separately", () => {
		const template = [
			"# Navigation",
			"### Links",
			"{{index}}",
			"### Summaries",
			"{{glossary}}",
		].join("\n");

		const result = utils.applyTemplate(template, {
			indexContent: "## Index\n- [[Alpha]]",
			glossaryContent: "## Glossary\n### Alpha",
		});

		assert.ok(result.includes("### Links\n## Index\n- [[Alpha]]"));
		assert.ok(result.includes("### Summaries\n## Glossary\n### Alpha"));
		assert.ok(result.includes("obsidian-auto-glossary"));
	});

	it("applyTemplate appends content if no placeholder is present", () => {
		const template = "# Static Header\nSome intro text.";
		const result = utils.applyTemplate(template, {
			content: "## Index\n- [[Alpha]]",
		});

		assert.ok(result.includes("# Static Header\nSome intro text.\n\n## Index\n- [[Alpha]]"));
		assert.ok(result.includes("obsidian-auto-glossary"));
	});
});

describe("extension & file filtering utilities", () => {
	it("parseExtensions correctly handles empty, comma, and space separated strings", () => {
		assert.deepEqual(utils.parseExtensions(""), []);
		assert.deepEqual(utils.parseExtensions("   "), []);
		assert.deepEqual(utils.parseExtensions("pdf, png, jpg"), ["pdf", "png", "jpg"]);
		assert.deepEqual(utils.parseExtensions(".pdf, .png; .canvas"), ["pdf", "png", "canvas"]);
	});

	it("filterFiles filters non-markdown files when includeNonMarkdown is false", () => {
		const files = [
			createTFile(1, "note1", { ctime: 1, mtime: 1, size: 1 }, "note1.md"),
			Object.assign(createTFile(2, "image.png", { ctime: 1, mtime: 1, size: 1 }, "image.png"), { extension: "png" }),
		];

		const res = utils.filterFiles(files, false);
		assert.equal(res.length, 1);
		assert.equal(res[0].name, "note1");
	});

	it("filterFiles allows whitelisted non-markdown extensions when enabled", () => {
		const files = [
			createTFile(1, "note1", { ctime: 1, mtime: 1, size: 1 }, "note1.md"),
			Object.assign(createTFile(2, "image.png", { ctime: 1, mtime: 1, size: 1 }, "image.png"), { extension: "png" }),
			Object.assign(createTFile(3, "doc.pdf", { ctime: 1, mtime: 1, size: 1 }, "doc.pdf"), { extension: "pdf" }),
			Object.assign(createTFile(4, "script.js", { ctime: 1, mtime: 1, size: 1 }, "script.js"), { extension: "js" }),
		];

		const res = utils.filterFiles(files, true, "png, pdf");
		assert.equal(res.length, 3);
		assert.equal(res[0].name, "note1");
		assert.equal(res[1].name, "image.png");
		assert.equal(res[2].name, "doc.pdf");
	});
});

describe("folder tree construction & sorting", () => {
	it("sortFolders sorts subfolders alphabetically and reverse", () => {
		const folders: utils.FolderTreeNode[] = [
			{ name: "Beta", path: "Beta", relativeDepth: 1, files: [], subfolders: [] },
			{ name: "Alpha", path: "Alpha", relativeDepth: 1, files: [], subfolders: [] },
			{ name: "Gamma", path: "Gamma", relativeDepth: 1, files: [], subfolders: [] },
		];

		utils.sortFolders(folders, utils.FileOrder.Alphabetical);
		assert.equal(folders[0].name, "Alpha");
		assert.equal(folders[1].name, "Beta");
		assert.equal(folders[2].name, "Gamma");

		utils.sortFolders(folders, utils.FileOrder.AlphabeticalRev);
		assert.equal(folders[0].name, "Gamma");
		assert.equal(folders[1].name, "Beta");
		assert.equal(folders[2].name, "Alpha");
	});

	it("buildFolderTree builds hierarchy with files first and sorts folders and files", () => {
		const files = [
			createTFile(1, "RootNote", { ctime: 1, mtime: 1, size: 1 }, "RootNote.md"),
			createTFile(2, "SubNote", { ctime: 1, mtime: 1, size: 1 }, "Sub/SubNote.md"),
			createTFile(3, "NestedNote", { ctime: 1, mtime: 1, size: 1 }, "Sub/Nested/NestedNote.md"),
		];

		const tree = utils.buildFolderTree("", "Vault", files, {
			includeSubfolders: true,
			fileOrder: utils.FileOrder.Alphabetical,
		});

		assert.equal(tree.name, "Vault");
		assert.equal(tree.files.length, 1);
		assert.equal(tree.files[0].name, "RootNote");
		assert.equal(tree.subfolders.length, 1);

		const sub = tree.subfolders[0];
		assert.equal(sub.name, "Sub");
		assert.equal(sub.files.length, 1);
		assert.equal(sub.files[0].name, "SubNote");
		assert.equal(sub.subfolders.length, 1);

		const nested = sub.subfolders[0];
		assert.equal(nested.name, "Nested");
		assert.equal(nested.files.length, 1);
		assert.equal(nested.files[0].name, "NestedNote");
	});

	it("buildFolderTree prunes empty folders when includeEmptyFolders is false", () => {
		const files = [createTFile(1, "Note1", { ctime: 1, mtime: 1, size: 1 }, "Folder/Note1.md")];

		const tree = utils.buildFolderTree("", "Vault", files, {
			includeSubfolders: true,
			includeEmptyFolders: false,
			knownFolderPaths: ["Folder", "EmptyFolder", "AnotherEmpty"],
		});

		assert.equal(tree.subfolders.length, 1);
		assert.equal(tree.subfolders[0].name, "Folder");
	});

	it("buildFolderTree retains empty folders when includeEmptyFolders is true", () => {
		const files = [createTFile(1, "Note1", { ctime: 1, mtime: 1, size: 1 }, "Folder/Note1.md")];

		const tree = utils.buildFolderTree("", "Vault", files, {
			includeSubfolders: true,
			includeEmptyFolders: true,
			knownFolderPaths: ["Folder", "EmptyFolder"],
		});

		assert.equal(tree.subfolders.length, 2);
		const emptySub = tree.subfolders.find((f) => f.name === "EmptyFolder");
		assert.ok(emptySub);
		assert.equal(emptySub.isEmpty, true);
	});
});



