import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFolder,
} from "obsidian";

import { CreateFileModal } from "./modal";
import { createFile } from "./glossaryIndex";
import { getEnum } from "./utils";

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

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Create index file")
							.setIcon("list")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									(
										option,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnum(option),
											this.settings.fileInclusion,
											fileName,
											chosenFolder,
											fileOrder,
											destFolder
										);
									},
									folder.path,
									folder.name + "_Index",
									"index"
								).open();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Create glossary file")
							.setIcon("layout-list")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									(
										option,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnum(option),
											this.settings.fileInclusion,
											fileName,
											chosenFolder,
											fileOrder,
											destFolder
										);
									},
									folder.path,
									folder.name + "_Glossary",
									"glossary"
								).open();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Create index+glossary file")
							.setIcon("list-ordered")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									(
										option,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnum(option),
											this.settings.fileInclusion,
											fileName,
											chosenFolder,
											fileOrder,
											destFolder
										);
									},
									folder.path,
									folder.name + "_GlossaryIndex",
									"glossaryindex"
								).open();
							});
					});
				}
			})
		);

		this.addCommand({
			id: "create-glossary",
			name: "Create glossary",
			callback: () => {
				new CreateFileModal(
					this.app,
					(option, fileName, chosenFolder, fileOrder, destFolder) => {
						createFile(
							this.app,
							getEnum(option),
							this.settings.fileInclusion,
							fileName,
							chosenFolder,
							fileOrder,
							destFolder
						);
					}
				).open();
			},
		});

		// SETTINGS
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
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
