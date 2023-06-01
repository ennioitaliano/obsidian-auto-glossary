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
								new Index({
									name: folder.name + "_Index",
									chosenFolder: folder,
									settings: this.settings,
								}).writeFile();
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
								new Glossary({
									name: folder.name + "_Glossary",
									chosenFolder: folder,
									settings: this.settings,
								}).writeFile();
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
								new GlossaryIndex({
									name: folder.name + "_GlossaryIndex",
									chosenFolder: folder,
									settings: this.settings,
								}).writeFile();
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
									new Index({
										name: folder.name + "_Index",
										chosenFolder: folder,
										settings: this.settings,
									}),
									(fileToGenerate: Index) =>
										fileToGenerate.writeFile()
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
									new Glossary({
										name: folder.name + "_Glossary",
										chosenFolder: folder,
										settings: this.settings,
									}),
									(fileToGenerate: Glossary) =>
										fileToGenerate.writeFile()
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
									new GlossaryIndex({
										name: folder.name + "_GlossaryIndex",
										chosenFolder: folder,
										settings: this.settings,
									}),
									(fileToGenerate: GlossaryIndex) =>
										fileToGenerate.writeFile()
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
					new Index({
						settings: this.settings,
						name: this.app.vault.getName() + "_Index",
						chosenFolder: this.app.vault.getRoot(),
					}),
					(fileToGenerate) => fileToGenerate.writeFile()
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
					new Glossary({
						name: this.app.vault.getName() + "_Glossary",
						chosenFolder: this.app.vault.getRoot(),
						settings: this.settings,
					}),
					(fileToGenerate: Glossary) => fileToGenerate.writeFile()
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
					new GlossaryIndex({
						name: this.app.vault.getName() + "_GlossaryIndex",
						chosenFolder: this.app.vault.getRoot(),
						settings: this.settings,
					}),
					(fileToGenerate: GlossaryIndex) =>
						fileToGenerate.writeFile()
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
