import { Plugin, TFolder } from "obsidian";

import { CreateFileModal } from "./CreateFileModal";
import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "settings";
import { Index } from "Index";
import { Glossary } from "Glossary";
import { GlossaryIndex } from "GlossaryIndex";

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
						item.setTitle("New index")
							.setIcon("list")
							.onClick(async () => {
								new Index(
									folder.name + "_Index",
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								).writeFile();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("New glossary")
							.setIcon("layout-list")
							.onClick(async () => {
								new Glossary(
									folder.name + "_Glossary",
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								).writeFile();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("New index+glossary")
							.setIcon("list-ordered")
							.onClick(async () => {
								new GlossaryIndex(
									folder.name + "_GlossaryIndex",
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								).writeFile();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Advanced index")
							.setIcon("list")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									this.settings,
									(fileToGenerate: Index) => {
										fileToGenerate.writeFile();
									},
									folder.path,
									folder.name + "_Index"
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
						item.setTitle("Advanced glossary")
							.setIcon("layout-list")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									this.settings,
									(fileToGenerate: Glossary) => {
										fileToGenerate.writeFile();
									},
									folder.path,
									folder.name + "_Glossary"
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
						item.setTitle("Advanced index+glossary")
							.setIcon("list-ordered")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									this.settings,
									(fileToGenerate: GlossaryIndex) => {
										fileToGenerate.writeFile();
									},
									folder.path,
									folder.name + "_GlossaryIndex"
								).open();
							});
					});
				}
			})
		);

		// Command to create index in root folder
		this.addCommand({
			id: "index-root",
			name: "Create index in root folder",
			callback: async () => {
				new CreateFileModal(
					this.app,
					this.settings,
					(fileToGenerate: Index) => {
						fileToGenerate.writeFile();
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_Index"
				).open();
			},
		});

		// Command to create glossary in root folder
		this.addCommand({
			id: "glossary-root",
			name: "Create glossary in root folder",
			callback: async () => {
				new CreateFileModal(
					this.app,
					this.settings,
					(fileToGenerate: Glossary) => {
						fileToGenerate.writeFile();
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_Glossary"
				).open();
			},
		});

		// Command to create index in root folder
		this.addCommand({
			id: "glossaryIndex-root",
			name: "Create a glossary with index in root folder",
			callback: async () => {
				new CreateFileModal(
					this.app,
					this.settings,
					(fileToGenerate: GlossaryIndex) => {
						fileToGenerate.writeFile();
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_GlossaryIndex"
				).open();
			},
		});

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
		console.info("Settings saved.");
	}
}
