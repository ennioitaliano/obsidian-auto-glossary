import { Plugin } from "obsidian";
import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "settings/settings";

export default class AutoGlossaryPlugin extends Plugin {
	settings: AutoGlossarySettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));
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
