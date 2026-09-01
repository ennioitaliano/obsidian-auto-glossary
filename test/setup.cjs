const Module = require("node:module");
const path = require("node:path");

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
	if (request === "obsidian") {
		return path.resolve(__dirname, "mocks/obsidian.ts");
	}
	return originalResolveFilename.call(this, request, parent, isMain, options);
};
