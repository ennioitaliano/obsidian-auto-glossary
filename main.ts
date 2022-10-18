import { notStrictEqual } from "assert";
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

import { ExampleModal } from "./modal";

var fs = require("fs");

// Remember to rename these classes and interfaces!

interface AutoGlossarySettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: AutoGlossarySettings = {
	mySetting: "default",
};

enum cases {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

class GlossaryIndex {
	notes: string[] = [];
	indexText: string;
	glossaryText: string;

	constructor(requestedFile: cases) {
		const notesTFile = global.app.vault.getMarkdownFiles();

		for (let i = 0; i < notesTFile.length; i++) {
			//console.log(i + notesTFile[i].path);
			this.notes[i] = notesTFile[i].path;
		}

		const glossaryArray = [];
		const indexArray = [];

		for (let i = 0; i < this.notes.length; i++) {
			// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
			const noteName = this.notes[i].slice(0, -3);

			// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded
			if (requestedFile == cases.gi) {
				indexArray[i] =
					"- [[glossaryIndex#" + noteName + "|" + noteName + "]]\n";
			} else {
				indexArray[i] = "- [[" + noteName + "]]\n";
			}

			// Array of strings that will show up as embedded notes
			glossaryArray[i] = "## ![[" + noteName + "]]\n";
		}

		// Removing glossary and index note if already created
		indexArray.remove("[[glossaryIndex#glossary|glossary]]\n");
		indexArray.remove("[[glossaryIndex#index|index]]\n");
		indexArray.remove("[[glossary]]\n");
		indexArray.remove("[[index]]\n");
		glossaryArray.remove("## ![[glossary]]\n");
		glossaryArray.remove("## ![[index]]\n");

		// Arrays toString + remove all ','
		this.indexText = "# Index\n" + indexArray.toString().replace(/,/g, "");
		this.glossaryText =
			"# Glossary\n" + glossaryArray.toString().replace(/,/g, "");
	}
}

// This takes in which type of file we want to create and an optional fileName
function createFile(requestedFile: cases, filename?: string) {
	const gloInd = new GlossaryIndex(requestedFile);
	let text = "";

	if (!gloInd.notes.toString().contains(requestedFile)) {
		switch (requestedFile) {
			case cases.g:
				text = gloInd.glossaryText;
				break;
			case cases.i:
				text = gloInd.indexText;
				break;
			case cases.gi:
				text = gloInd.indexText + "\n***\n\n" + gloInd.glossaryText;
				break;
			default:
				break;
		}

		if (filename) {
			this.app.vault.create(filename + ".md", text);
		} else {
			this.app.vault.create(requestedFile + ".md", text);
		}
	} else {
		//UNDERSTAND HOW TO SHOW ERROR
		new Notice("Already existing file");
	}
}

function getEnum(value: string) : cases{
	let result : cases = cases.gi;

	switch (value.toLowerCase()) {
		case "glossary":
			result = cases.g;
			break;
		case "index":
			result = cases.i;
			break;
		case "glossaryindex":
			result = cases.gi;
			break;
		default:
			break;
	}

	return result;
}

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
				new ExampleModal(this.app, (option, fileName) => {
					console.log(option);
					createFile(getEnum(option), fileName);
					new Notice(`${option} file created`);
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
