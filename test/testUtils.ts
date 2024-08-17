import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TFile, FileStats } from "obsidian";
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
const testFileName: Array<string> = ["testFile1", "testFile3", "testFile2", "testFile3"];
const testFiles: TFile[]  = [
  createTFile(1, testFileName[0], {
    ctime: 5,
    mtime: 10,
    size: 50,
  }),
  createTFile(1, testFileName[1], {
    ctime: 10,
    mtime: 5,
    size: 8,
  }),
  createTFile(1, testFileName[2], {
    ctime: 7,
    mtime: 10,
    size: 1,
  }),
  createTFile(1, testFileName[3], {
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

  describe("sortFiles", () => {
    it(`sorts ${utils.fileOrder.ctime_new} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.ctime_new);

      assert.equal(4, files.length);

      const expectedCTimes: Array<number> = [15, 10, 7, 5];
      for (let i = 0; i < expectedCTimes.length; i++)
      {
        assert.equal(expectedCTimes[i], files[i].stat.ctime);
      }
    });

    it(`sorts by ${utils.fileOrder.ctime_old} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.ctime_old);

      assert.equal(4, files.length);

      const expectedCTimes: Array<number> = [5, 7 , 10, 15];
      for (let i = 0; i < expectedCTimes.length; i++)
      {
        assert.equal(expectedCTimes[i], files[i].stat.ctime);
      }
    });

    it(`sorts by ${utils.fileOrder.alphabetical} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.alphabetical);

      assert.equal(4, files.length);

      const expectedFilenameSort = testFileName.sort();
      for (let i = 0; i < expectedFilenameSort.length; i++)
      {
        assert.equal(expectedFilenameSort[i], files[i].name);
      }
    });

    it(`sorts by ${utils.fileOrder.alphabetical_rev} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.alphabetical_rev);

      assert.equal(4, files.length);

      const expectedFilenameSort = testFileName.sort().reverse();
      for (let i = 0; i < expectedFilenameSort.length; i++)
      {
        assert.equal(expectedFilenameSort[i], files[i].name);
      }
    });

    it(`sorts by ${utils.fileOrder.mtime_new} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.mtime_new);

      assert.equal(4, files.length);

      const expectedMTimes = [15, 10, 10, 5];
      for (let i = 0; i < expectedMTimes.length; i++)
      {
        assert.equal(expectedMTimes[i], files[i].stat.mtime);
      }
    });

    it(`sorts by ${utils.fileOrder.mtime_old} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.mtime_old);

      assert.equal(4, files.length);

      const expectedMTimes = [5, 10, 10, 15];
      for (let i = 0; i < expectedMTimes.length; i++)
      {
        assert.equal(expectedMTimes[i], files[i].stat.mtime);
      }
    });

    it(`${utils.fileOrder.default} does not sort files`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.default);

      assert.equal(4, files.length);

      for (let i = 0; i < files.length; i++)
      {
        assert.equal(files[i], files[i]);
      }
    });
    
    it("Unrecognized file order does not sort files", () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, <utils.fileOrder>"unknown");

      assert.equal(4, files.length);

      for (let i = 0; i < files.length; i++)
      {
        assert.equal(files[i], files[i]);
      }
    });
  });
});