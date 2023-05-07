import { Plugin, TFolder } from "obsidian";

import { CreateFileModal } from "./modal";
import {
	createIndexFile,
	createGlossaryFile,
	createGlossaryIndexFile,
} from "./glossaryIndex";
import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "settings";

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
								createIndexFile(
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.name + "_Index",
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								);
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
								createGlossaryFile(
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.name + "_Glossary",
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								);
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
								createGlossaryIndexFile(
									this.settings.includeFiles,
									this.settings.fileOverwrite,
									folder.name + "_GlossaryIndex",
									folder.path,
									this.settings.fileOrder,
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								);
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
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createIndexFile(
											this.settings.includeFiles,
											overwrite,
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
						item.setTitle("Advanced glossary")
							.setIcon("layout-list")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createGlossaryFile(
											this.settings.includeFiles,
											overwrite,
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
						item.setTitle("Advanced index+glossary")
							.setIcon("list-ordered")
							.onClick(async () => {
								new CreateFileModal(
									this.app,
									this.settings.fileOverwrite,
									this.settings.sameDest,
									this.settings.fileDest,
									this.settings.fileOrder,
									(
										overwrite,
										fileName,
										chosenFolder,
										fileOrder,
										destFolder
									) => {
										createGlossaryIndexFile(
											this.settings.includeFiles,
											overwrite,
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

		// Command to create index in root folder
		this.addCommand({
			id: "index-root",
			name: "Create index in root folder",
			callback: async () => {
				new CreateFileModal(
					this.app,
					this.settings.fileOverwrite,
					this.settings.sameDest,
					this.settings.fileDest,
					this.settings.fileOrder,
					(
						overwrite,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder
					) => {
						createIndexFile(
							this.settings.includeFiles,
							overwrite,
							fileName,
							chosenFolder,
							fileOrder,
							destFolder
						);
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_Index",
					"index"
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
					this.settings.fileOverwrite,
					this.settings.sameDest,
					this.settings.fileDest,
					this.settings.fileOrder,
					(
						overwrite,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder
					) => {
						createGlossaryFile(
							this.settings.includeFiles,
							overwrite,
							fileName,
							chosenFolder,
							fileOrder,
							destFolder
						);
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_Glossary",
					"glossary"
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
					this.settings.fileOverwrite,
					this.settings.sameDest,
					this.settings.fileDest,
					this.settings.fileOrder,
					(
						overwrite,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder
					) => {
						createGlossaryIndexFile(
							this.settings.includeFiles,
							overwrite,
							fileName,
							chosenFolder,
							fileOrder,
							destFolder
						);
					},
					this.app.vault.getName(),
					this.app.vault.getName() + "_GlossaryIndex",
					"glossaryindex"
				).open();
			},
		});

		// SETTINGS
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this));
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
