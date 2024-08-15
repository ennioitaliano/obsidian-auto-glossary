import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as utils from "../src/utils";

describe("getEnumFT", () => {
  it("success", () => {
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
