import { Plugin, TFolder } from "obsidian";
import {
	AutoGlossarySettings,
	DEFAULT_SETTINGS,
	SettingTab,
	MyFolder,
	Index
} from "./old/modules_OLD";

export default class AutoGlossaryPlugin extends Plugin {
	settings: AutoGlossarySettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("New index")
							.setIcon("list")
							.onClick(async () => {
								// new MyFolder(folder).index(this.settings)
								// new Index(
								// 	folder.name + "_index",
								// 	new MyFolder(folder),
								// 	this.settings
								// )
								const myF = new MyFolder(folder)
								new Index(
									folder.name + "_index",
									myF,
									this.settings
								)
								console.log("Index")
							}
							);
					});
				}
			})
		);
	}

	onunload() {}

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
