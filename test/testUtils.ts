import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TFile, FileStats } from "obsidian";
import { cloneDeep } from "lodash";

import * as utils from "../src/utils";

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

    const testFiles: TFile[]  = [
      createTFile(1, "testFile1", {
        ctime: 5,
        mtime: 10,
        size: 50,
      }),
      createTFile(1, "testFile1", {
        ctime: 10,
        mtime: 5,
        size: 8,
      }),
      createTFile(1, "testFile1", {
        ctime: 7,
        mtime: 10,
        size: 1,
      }),
    ];

    it(`sorts ${utils.fileOrder.ctime_new} files correctly`, () => {
      const files: TFile[] = cloneDeep(testFiles);
      utils.sortFiles(files, utils.fileOrder.ctime_new);

      assert.equal(3, files.length);

      const expectedCTimes: Array<number> = [10, 7, 5];
      for (let i = 0; i < expectedCTimes.length; i++)
      {
        assert.equal(expectedCTimes[i], files[i].stat.ctime);
      }
    });
  });
});