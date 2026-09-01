import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { App, PluginManifest } from "obsidian";
import AutoGlossaryPlugin from "../src/main";
import { SettingTab, DEFAULT_SETTINGS } from "../src/settings";

const dummyManifest: PluginManifest = {
	id: "auto-glossary",
	name: "Auto Glossary",
	version: "1.0.2",
	minAppVersion: "1.5.0",
	description: "",
	author: "",
};

describe("SettingTab", () => {
	it("initializes with default settings", () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		assert.equal(plugin.settings.fileInclusion, false);
		assert.equal(plugin.settings.sameDest, true);
		assert.equal(plugin.settings.fileOrder, "default");
		assert.equal(plugin.settings.includeSubfolders, true);
		assert.equal(plugin.settings.includeEmptyFolders, false);
	});

	it("renders display() without errors", () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		const tab = new SettingTab(app, plugin);

		assert.doesNotThrow(() => {
			tab.display();
		});
	});
});
