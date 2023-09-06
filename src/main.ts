import { Plugin } from "obsidian";
import { AutoGlossarySettings, DEFAULT_SETTINGS } from "old/settings_OLD";

export default class AutoGlossaryPlugin extends Plugin {
	settings: AutoGlossarySettings;

	async onload() {
		await this.loadSettings();
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
