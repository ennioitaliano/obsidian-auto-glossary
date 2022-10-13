import {
	App,
	Editor,
	getIcon,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

var fs = require("fs");

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

class GlossaryIndex {
	notes: TFile[];
	indexText: string;
	glossaryText: string;

	constructor() {
		this.notes = global.app.vault.getMarkdownFiles();

		const glossaryArray = [];
		const indexArray = [];

		for (let i = 0; i < this.notes.length; i++) {
			//console.log(files[i].path.slice(0, -3));
			// cambiare in [[nomediquestofile#titolo|titolo]]
			indexArray[i] = "[[" + this.notes[i].path.slice(0, -3) + "]]\n";
			glossaryArray[i] = "!" + indexArray[i];
		}

		this.indexText = indexArray.toString().replace(/,/g, "");
		this.glossaryText = glossaryArray.toString().replace(/,/g, "");
	}
}

// Three functions kinda boilerplate -> improvable

function createGlossary() {
	const gi = new GlossaryIndex();

	if (!gi.notes.toString().contains("![[glossary]]\n")) {
		this.app.vault.create("glossary.md", gi.glossaryText);
	} else {
		console.log("Already existing file");
	}
}

function createIndex() {
	const gi = new GlossaryIndex();

	if (!gi.notes.toString().contains("![[index]]\n")) {
		this.app.vault.create("index.md", gi.indexText);
	} else {
		console.log("Already existing file");
	}
}

function createGlossaryIndex() {
	const gi = new GlossaryIndex();

	if (!gi.notes.toString().contains("![[glossaryIndex]]\n")) {
		this.app.vault.create("glossaryIndex.md", gi.indexText+gi.glossaryText);
	} else {
		console.log("Already existing file");
	}
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log("Auto Glossary enabled");

		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Auto Glossary",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				createGlossary();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "create-glossary",
			name: "Create a glossary with all files",
			callback: () => {
				createGlossary();
			},
		});

		this.addCommand({
			id: "create-index",
			name: "Create an index with all files",
			callback: () => {
				createIndex();
			},
		});

		this.addCommand({
			id: "create-glossary-index",
			name: "Create a glossary with an index of all files",
			callback: () => {
				createGlossaryIndex();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

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

class SampleSettingTab extends PluginSettingTab {
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
}
