// import { Plugin, TFolder } from "obsidian";
// import {
// 	AutoGlossarySettings,
// 	DEFAULT_SETTINGS,
// 	SettingTab,
// 	MyFolder,
// } from "./modules_OLD";

// export default class autoGlossary extends Plugin {
// 	// SETTINGS
// 	settings: AutoGlossarySettings;
// 	async onload() {
// 		console.info("Auto Glossary enabled");

// 		//SETTINGS
// 		await this.loadSettings();
// 		/* // This creates an icon in the left ribbon.
// 		const ribbonIconEl = this.addRibbonIcon(
// 			"dice",
// 			"Auto Glossary",
// 			(evt: MouseEvent) => {
// 			}
// 		);
// 		// Perform additional things with the ribbon
// 		ribbonIconEl.addClass("my-plugin-ribbon-class");*/

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("New index")
// 							.setIcon("list")
// 							.onClick(async () =>
// 								new MyFolder(folder).index(this.settings)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("New glossary")
// 							.setIcon("layout-list")
// 							.onClick(async () =>
// 								new MyFolder(folder).glossary(this.settings)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("New index+glossary")
// 							.setIcon("list-ordered")
// 							.onClick(async () =>
// 								new MyFolder(folder).glossaryIndex(
// 									this.settings
// 								)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("Advanced index")
// 							.setIcon("list")
// 							.onClick(async () =>
// 								new MyFolder(folder).advancedIndex(
// 									this.app,
// 									this.settings
// 								)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("Advanced glossary")
// 							.setIcon("layout-list")
// 							.onClick(async () =>
// 								new MyFolder(folder).advancedGlossary(
// 									this.app,
// 									this.settings
// 								)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		this.registerEvent(
// 			this.app.workspace.on("file-menu", (menu, folder) => {
// 				if (folder instanceof TFolder) {
// 					menu.addItem((item) => {
// 						item.setTitle("Advanced index+glossary")
// 							.setIcon("list-ordered")
// 							.onClick(async () =>
// 								new MyFolder(folder).advancedGlossary(
// 									this.app,
// 									this.settings
// 								)
// 							);
// 					});
// 				}
// 			})
// 		);

// 		// Command to create index in root folder
// 		this.addCommand({
// 			id: "index-root",
// 			name: "Create index in root folder",
// 			callback: async () =>
// 				new MyFolder(this.app.vault.getRoot()).advancedIndex(
// 					this.app,
// 					this.settings
// 				),
// 		});

// 		// Command to create glossary in root folder
// 		this.addCommand({
// 			id: "glossary-root",
// 			name: "Create glossary in root folder",
// 			callback: async () =>
// 				new MyFolder(this.app.vault.getRoot()).advancedGlossary(
// 					this.app,
// 					this.settings
// 				),
// 		});

// 		// Command to create index in root folder
// 		this.addCommand({
// 			id: "glossaryIndex-root",
// 			name: "Create a glossary with index in root folder",
// 			callback: async () =>
// 				new MyFolder(this.app.vault.getRoot()).advancedGlossaryIndex(
// 					this.app,
// 					this.settings
// 				),
// 		});

// 		// SETTINGS
// 		// This adds a settings tab so the user can configure various aspects of the plugin
// 		this.addSettingTab(new SettingTab(this.app, this));
// 	}

// 	onunload() {
// 		console.info("Auto Glossary unloaded");
// 	}

// 	// SETTINGS
// 	async loadSettings() {
// 		this.settings = Object.assign(
// 			{},
// 			DEFAULT_SETTINGS,
// 			await this.loadData()
// 		);
// 	}

// 	async saveSettings() {
// 		await this.saveData(this.settings);
// 		console.info("Settings saved.");
// 	}
// }
