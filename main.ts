import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

import { CreateFileModal } from "./modal";
import { createFile } from "./glossaryIndex";
import { getEnum } from "./utils";

// Remember to rename these classes and interfaces!

interface AutoGlossarySettings {
	fileInclusion: boolean;
}

const DEFAULT_SETTINGS: AutoGlossarySettings = {
	fileInclusion: false,
};

export default class autoGlossary extends Plugin {
	// SETTINGS
	settings: AutoGlossarySettings;
	async onload() {
		console.log("Auto Glossary enabled");

		//SETTINGS
		await this.loadSettings();

		/* // This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Auto Glossary",
			(evt: MouseEvent) => {
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");*/

		this.addCommand({
			id: "create-glossary",
			name: "Create glossary",
			callback: () => {
				new CreateFileModal(this.app, (option, fileName) => {
					createFile(
						getEnum(option),
						this.settings.fileInclusion,
						fileName
					);
				}).open();
			},
		});

		// SETTINGS
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {
		console.log("Auto Glossary disabled");
	}

	// SETTINGS
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// SETTINGS
class SettingTab extends PluginSettingTab {
	plugin: autoGlossary;

	constructor(app: App, plugin: autoGlossary) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Auto Glossary Settings" });

		new Setting(containerEl)
			.setName("File inclusion")
			.setDesc(
				"Include previously generated files in glossaries and indexes"
			)
			.addToggle((toggle) =>
				toggle
				.setValue(this.plugin.settings.fileInclusion)
				.onChange(async (value) => {
					console.log("fileInclusion switched to " + value);
					this.plugin.settings.fileInclusion = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
