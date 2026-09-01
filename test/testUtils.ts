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

