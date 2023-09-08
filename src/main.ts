import { Plugin, TFolder } from "obsidian";
// import { MyFolder } from "old/my_folder_OLD";
// import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "settings/settings";
import { MyFolder, AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "./old/modules_OLD";

export default class AutoGlossaryPlugin extends Plugin {
	settings: AutoGlossarySettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Advanced index")
							.setIcon("list")
							.onClick(async () =>
								new MyFolder(folder).advancedIndex(
									this.app,
									this.settings
								)
							);
					});
				}
			})
		);
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
