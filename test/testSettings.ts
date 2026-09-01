import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { App, PluginManifest } from "obsidian";
import AutoGlossaryPlugin from "../src/main";
import { SettingTab, DEFAULT_SETTINGS } from "../src/settings";

const dummyManifest: PluginManifest = {
	id: "auto-glossary",
	name: "Auto Glossary",
	version: "1.0.1",
	minAppVersion: "1.5.0",
	description: "",
	author: "",
};

describe("SettingTab", () => {
	it("returns valid declarative setting definitions", () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		const tab = new SettingTab(app, plugin);

		const definitions = tab.getSettingDefinitions();
		assert.ok(Array.isArray(definitions));
		assert.equal(definitions.length, 4);

		const headings = definitions.map((d) => ("heading" in d ? d.heading : ""));
		assert.deepEqual(headings, [
			"Inclusion & Subfolders",
			"Default options",
			"Filename patterns",
			"Templates",
		]);
	});

	it("gets and sets control values properly", async () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		plugin.settings = { ...DEFAULT_SETTINGS };
		const tab = new SettingTab(app, plugin);

		assert.equal(tab.getControlValue("fileInclusion"), false);

		await tab.setControlValue("fileInclusion", true);
		assert.equal(tab.getControlValue("fileInclusion"), true);
		assert.equal(plugin.settings.fileInclusion, true);

		// When sameDest is set to true, fileDest is cleared
		plugin.settings.fileDest = "Some/Path";
		await tab.setControlValue("sameDest", true);
		assert.equal(plugin.settings.fileDest, "");
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
