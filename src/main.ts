import { App, Plugin, PluginSettingTab, Setting, TFolder } from "obsidian";

import { CreateFileModal } from "./modal";
import { createFile } from "./glossaryIndex";
import { getEnumFT, getEnumFO, fileType } from "./utils";

interface AutoGlossarySettings {
	fileInclusion: boolean;
	sameDest: boolean;
	fileDest: string;
	fileOverwrite: boolean;
	fileOrder: string;
}

const DEFAULT_SETTINGS: AutoGlossarySettings = {
	fileInclusion: false,
	sameDest: true,
	fileDest: "",
	fileOverwrite: false,
	fileOrder: "default",
};

export default class autoGlossary extends Plugin {
	// SETTINGS
	settings: AutoGlossarySettings;
	async onload() {
		console.info("Auto Glossary enabled");

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
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										option,
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnumFT(option),
											this.settings.fileInclusion,
											overwrite,
											fileName,
											chosenFolder,
											getEnumFO(fileOrder),
											destFolder
										);
									},
									folder.path,
									folder.name + "_Index",
									fileType.i
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
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										option,
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnumFT(option),
											this.settings.fileInclusion,
											overwrite,
											fileName,
											chosenFolder,
											getEnumFO(fileOrder),
											destFolder
										);
									},
									folder.path,
									folder.name + "_Glossary",
									fileType.g
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
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										option,
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createFile(
											this.app,
											getEnumFT(option),
											this.settings.fileInclusion,
											overwrite,
											fileName,
											chosenFolder,
											getEnumFO(fileOrder),
											destFolder
										);
									},
									folder.path,
									folder.name + "_GlossaryIndex",
									fileType.gi
								).open();
							});
					});
				}
			})
		);

		/*this.addCommand({
			id: "create-glossary",
			name: "Create glossary",
			callback: () => {
				new CreateFileModal(
					this.app,
					this.settings.fileOverwrite,
					(
						option,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder,
						overwrite
					) => {
						createFile(
							this.app,
							getEnumFT(option),
							this.settings.fileInclusion,
							fileName,
							overwrite,
							chosenFolder,
							getEnumFO(fileOrder),
							destFolder
						);
					}
				).open();
			},
		});*/

		// SETTINGS
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
		console.info("Auto Glossary unloaded");
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
		console.log("Settings saved.");
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
				"Include previously generated files in glossaries and indexes."
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

		containerEl.createEl("h3", { text: "Default options" });

		new Setting(containerEl)
			.setName("Same destination as folder")
			.setDesc(
				"If on, files will be created in the same folder specified above and the 'Destination' field will be disabled."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.sameDest)
					.onChange(async (value) => {
						console.log("sameDest switched to " + value);
						this.plugin.settings.sameDest = value;
						destination.setDisabled(value);
						await this.plugin.saveSettings();
					})
			);

		const destination = new Setting(containerEl);

		destination
			.setName("Destination")
			.setDesc(
				"If the above toggle is off, specify here the destination folder for the files created."
			)
			.addText((text) =>
				text
					.onChange(async (value) => {
						this.plugin.settings.fileDest = value;
						console.log("fileDest switched to " + value);
						await this.plugin.saveSettings();
					})
					.setValue(this.plugin.settings.fileDest)
					.setDisabled(true)
			)
			.setDisabled(this.plugin.settings.sameDest);

		new Setting(containerEl)
			.setName("Overwrite existing files")
			.setDesc(
				"Set the default behavior when a file already exists. Can be changed every time in the modal."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fileOverwrite)
					.onChange(async (value) => {
						console.log("fileOverwrite switched to " + value);
						this.plugin.settings.fileOverwrite = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File order")
			.setDesc("The order for the files to be indexed.")
			.addDropdown((drop) =>
				drop
					.addOption("default", "Default")
					.addOption(
						"mtime_new",
						"Modification time - Newest to oldest"
					)
					.addOption(
						"mtime_old",
						"Modification time - Oldest to newest"
					)
					.addOption("ctime_new", "Creation time - Newest to oldest")
					.addOption("ctime_old", "Creation time - Oldest to newest")
					.addOption("alphabetical", "Alphabetical")
					.addOption("alphabetical_rev", "Alphabetical - Reverse")
					.setValue(this.plugin.settings.fileOrder)
					.onChange(async (chosen) => {
						console.log("fileOrder switched to " + chosen);
						this.plugin.settings.fileOrder = chosen;
						await this.plugin.saveSettings();
					})
			);
	}
}
