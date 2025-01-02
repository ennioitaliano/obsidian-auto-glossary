import autoGlossary from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

/** Settings used for the creation of the index/glossary file */
export interface AutoGlossarySettings {
	/** If true, includes files created by the plugin */
	fileInclusion: boolean;
	/** If true, indicates the same directory that was chosen to get contents for index/glossary will also be used as the destination of the newly created index/glossary file */
	sameDest: boolean;
	/** The path destination that the index/glossary will be created in (sameDest must be false) */
	fileDest: string;
	/** If true, the newly created index/glossary file will overwrite a file if it already exists */
	fileOverwrite: boolean;
	/** A string representing the fileOrder enum type, indicates what type file ordering should be use in the creation of the index/glossary */
	fileOrder: string;
}

/** Default settings for index and glossary file creation */
export const DEFAULT_SETTINGS: AutoGlossarySettings = {
	fileInclusion: false,
	sameDest: true,
	fileDest: "",
	fileOverwrite: false,
	fileOrder: "default",
};

export class SettingTab extends PluginSettingTab {
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
						if (value) {
							this.plugin.settings.fileDest = "";
						}
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
			.addText((destText) =>
				destText
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
