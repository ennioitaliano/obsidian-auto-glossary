import { notStrictEqual } from "assert";
import { Plugin } from "obsidian";

import { CreateFileModal } from "./modal";
import { createFile } from "./glossaryIndex";
import { getEnum } from "./utils";

// Remember to rename these classes and interfaces!

interface AutoGlossarySettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: AutoGlossarySettings = {
	mySetting: "default",
};

export default class autoGlossary extends Plugin {
	// SETTINGS
	//settings: AutoGlossarySettings
	async onload() {
		console.log("Auto Glossary enabled");

		//SETTINGS
		// await this.loadSettings();

		/* // This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Auto Glossary",
			(evt: MouseEvent) => {
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");*/

		// ctrl+P commands
		/*this.addCommand({
			id: "create-glossary",
			name: "Create a glossary with all files",
			callback: () => {
				createFile(cases.g);
			},
		});

		this.addCommand({
			id: "create-index",
			name: "Create an index with all files",
			callback: () => {
				createFile(cases.i);
			},
		});

		this.addCommand({
			id: "create-glossary-index",
			name: "Create a glossary with an index of all files",
			callback: () => {
				createFile(cases.gi);
			},
		});*/

		this.addCommand({
			id: "create-glossary",
			name: "Create glossary",
			callback: () => {
				new CreateFileModal(this.app, (option, fileName) => {
					createFile(getEnum(option), fileName);
				}).open();
			},
		});

		// SETTINGS
		/*// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));*/

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
	/*async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}*/
}

// SETTINGS
/*class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	 display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}*/
