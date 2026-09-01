import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { App, PluginManifest } from "obsidian";
import AutoGlossaryPlugin from "../src/main";
import { SettingTab, DEFAULT_SETTINGS } from "../src/settings";

const dummyManifest: PluginManifest = {
	id: "auto-glossary",
	name: "Auto Glossary",
	version: "1.0.3",
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

	it("returns setting definitions with all 4 groups and 16 setting items", () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		const tab = new SettingTab(app, plugin);

		const definitions = tab.getSettingDefinitions();
		assert.equal(definitions.length, 4);

		const headings = definitions.map((d) => (d as { heading?: string }).heading);
		assert.deepEqual(headings, [
			"Inclusion & Subfolders",
			"Defaults",
			"Filename patterns",
			"Templates",
		]);

		const allItems = definitions.flatMap((d) => (d as { items?: unknown[] }).items ?? []);
		assert.equal(allItems.length, 16);
	});

	it("evaluates disabled dynamic predicates in setting definitions", () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		const tab = new SettingTab(app, plugin);

		const definitions = tab.getSettingDefinitions();
		const inclusionGroup = definitions[0] as { items: { name: string; control: { key: string; disabled?: () => boolean } }[] };
		const nonMdSetting = inclusionGroup.items.find((i) => i.control.key === "nonMarkdownExtensions");
		assert.ok(nonMdSetting?.control.disabled);
		assert.equal(typeof nonMdSetting.control.disabled, "function");

		plugin.settings.includeNonMarkdown = false;
		assert.equal(nonMdSetting.control.disabled(), true);

		plugin.settings.includeNonMarkdown = true;
		assert.equal(nonMdSetting.control.disabled(), false);

		const defaultsGroup = definitions[1] as { items: { name: string; control: { key: string; disabled?: () => boolean } }[] };
		const destSetting = defaultsGroup.items.find((i) => i.control.key === "fileDest");
		assert.ok(destSetting?.control.disabled);
		assert.equal(typeof destSetting.control.disabled, "function");

		plugin.settings.sameDest = true;
		assert.equal(destSetting.control.disabled(), true);

		plugin.settings.sameDest = false;
		assert.equal(destSetting.control.disabled(), false);
	});

	it("gets and sets control values correctly via getControlValue and setControlValue", async () => {
		const app = new App();
		const plugin = new AutoGlossaryPlugin(app, dummyManifest);
		const tab = new SettingTab(app, plugin);

		assert.equal(tab.getControlValue("fileInclusion"), false);
		await tab.setControlValue("fileInclusion", true);
		assert.equal(plugin.settings.fileInclusion, true);
		assert.equal(tab.getControlValue("fileInclusion"), true);

		await tab.setControlValue("excludedTags", "  draft, private  ");
		assert.equal(plugin.settings.excludedTags, "draft, private");

		plugin.settings.fileDest = "Glossaries";
		await tab.setControlValue("sameDest", true);
		assert.equal(plugin.settings.sameDest, true);
		assert.equal(plugin.settings.fileDest, "");
	});
});
