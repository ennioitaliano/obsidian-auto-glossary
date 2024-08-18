import * as assert from "node:assert/strict";
// @ts-ignore - TODO: this import is correct for beforeEach, this should be investigated
import { describe, it, beforeEach, mock } from "node:test";
import { App, TFile, FileStats } from "obsidian";
import { cloneDeep } from "lodash";

import * as utils from "../src/utils";

/*********************
 *       UTILS       *
 *********************/
const createTFile = (fileNum: number, name: string, stat: FileStats): TFile => {
  return {
    basename: `testFile${fileNum}`,
    extension: "txt",
    stat,
    vault: <any>{},
    path: "testPath",
    name: name,
    parent: <any>{}
  }
};

/*********************
 *     CONSTANTS     *
 *********************/
const TEST_FILENAME: Array<string> = ["testFile1", "testFile3", "testFile2", "testFile3"];
const TEST_FILES: TFile[]  = [
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
	let result: utils.fileType;

    result = utils.getEnumFT("glossary");
    assert.equal(utils.fileType.g, result);

    result = utils.getEnumFT("index");
    assert.equal(utils.fileType.i, result);

    result = utils.getEnumFT("glossaryIndex");
    assert.equal(utils.fileType.gi, result);

    result = utils.getEnumFT("default");
    assert.equal(utils.fileType.gi, result);
  });
});

describe("getEnumFO", () => {
  it("succesfully returns the file order enum key", () => {
    let result: utils.fileOrder;

    result = utils.getEnumFO("");
    assert.equal(utils.fileOrder.default, result);

    result = utils.getEnumFO("default");
    assert.equal(utils.fileOrder.default, result);

    result = utils.getEnumFO("anyOtherStringInput");
    assert.equal(utils.fileOrder.default, result);
    
    result = utils.getEnumFO("mtime_new");
    assert.equal(utils.fileOrder.mtime_new, result);

    result = utils.getEnumFO("mtime_old");
    assert.equal(utils.fileOrder.mtime_old, result);

    result = utils.getEnumFO("ctime_new");
    assert.equal(utils.fileOrder.ctime_new, result);

    result = utils.getEnumFO("ctime_old");
    assert.equal(utils.fileOrder.ctime_old, result);

    result = utils.getEnumFO("alphabetical");
    assert.equal(utils.fileOrder.alphabetical, result);

    result = utils.getEnumFO("alphabetical_rev");
    assert.equal(utils.fileOrder.alphabetical_rev, result);
  });

});

describe("sortFiles", () => {
  let testFiles: Array<TFile>;
  let testFilenames: Array<string>;

  beforeEach(() => {
    testFiles = cloneDeep(TEST_FILES);
    testFilenames = cloneDeep(TEST_FILENAME);
  });

  it(`sorts ${utils.fileOrder.ctime_new} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.ctime_new);

    assert.equal(4, testFiles.length);

    const expectedCTimes: Array<number> = [15, 10, 7, 5];
    for (let i = 0; i < expectedCTimes.length; i++)
    {
      assert.equal(expectedCTimes[i], testFiles[i].stat.ctime);
    }
  });

  it(`sorts by ${utils.fileOrder.ctime_old} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.ctime_old);

    assert.equal(4, testFiles.length);

    const expectedCTimes: Array<number> = [5, 7 , 10, 15];
    for (let i = 0; i < expectedCTimes.length; i++)
    {
      assert.equal(expectedCTimes[i], testFiles[i].stat.ctime);
    }
  });

  it(`sorts by ${utils.fileOrder.alphabetical} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.alphabetical);

    assert.equal(4, testFiles.length);

    const expectedFilenameSort = testFilenames.sort();
    for (let i = 0; i < expectedFilenameSort.length; i++)
    {
      assert.equal(expectedFilenameSort[i], testFiles[i].name);
    }
  });

  it(`sorts by ${utils.fileOrder.alphabetical_rev} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.alphabetical_rev);

    assert.equal(4, testFiles.length);

    const expectedFilenameSort = testFilenames.sort().reverse();
    for (let i = 0; i < expectedFilenameSort.length; i++)
    {
      assert.equal(expectedFilenameSort[i], testFiles[i].name);
    }
  });

  it(`sorts by ${utils.fileOrder.mtime_new} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.mtime_new);

    assert.equal(4, testFiles.length);

    const expectedMTimes = [15, 10, 10, 5];
    for (let i = 0; i < expectedMTimes.length; i++)
    {
      assert.equal(expectedMTimes[i], testFiles[i].stat.mtime);
    }
  });

  it(`sorts by ${utils.fileOrder.mtime_old} files correctly`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.mtime_old);

    assert.equal(4, testFiles.length);

    const expectedMTimes = [5, 10, 10, 15];
    for (let i = 0; i < expectedMTimes.length; i++)
    {
      assert.equal(expectedMTimes[i], testFiles[i].stat.mtime);
    }
  });

  it(`${utils.fileOrder.default} does not sort files`, () => {
    utils.sortFiles(testFiles, utils.fileOrder.default);

    assert.equal(4, testFiles.length);

    for (let i = 0; i < testFiles.length; i++)
    {
      // Note: basename is a unique identifier used here
      assert.equal(testFiles[i].basename, TEST_FILES[i].basename);
    }
  });
  
  it("Unrecognized file order does not sort files", () => {
    utils.sortFiles(testFiles, <utils.fileOrder>"unknown");

    assert.equal(4, testFiles.length);

    for (let i = 0; i < testFiles.length; i++)
    {
      // Note: basename is a unique identifier used here
      assert.equal(testFiles[i].basename, TEST_FILES[i].basename);
    }
  });

  describe("fileExists", () => {
    let filename: string;

    beforeEach(() => {
      filename = "testFile.txt";
    });

    it("successfully checks that a file exists", async () => {
      // TODO: remove these anys by improving typing
      const app: App = <any>{
        vault: <any>{
          adapter: <any>{
            exists: mock.fn((filename: string) => {
              return true;
            }),
          }
        }
      };
      const exists: boolean = await utils.fileExists(app, filename);

      // TODO: improve typing by avoiding typing
      assert.equal(1, (<mock>app.vault.adapter.exists).mock.callCount())
      assert.equal(true, exists);
    });

    it("successfully checks that a file doesn't exist", async () => {
      // TODO: remove these anys by improving typing
      const app: App = <any>{
        vault: <any>{
          adapter: <any>{
            exists: mock.fn((filename: string) => {
              return false;
            }),
          }
        }
      };
      const exists: boolean = await utils.fileExists(app, filename);

      // TODO: improve typing by avoiding typing
      assert.equal(1, (<mock>app.vault.adapter.exists).mock.callCount())
      assert.equal(false, exists);
    });
  });
});
