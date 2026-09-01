import AutoGlossaryPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface AutoGlossarySettings {
	fileInclusion: boolean;
	sameDest: boolean;
	fileDest: string;
	fileOverwrite: boolean;
	fileOrder: string;
	indexPattern: string;
	glossaryPattern: string;
	glossaryIndexPattern: string;
}

export const DEFAULT_SETTINGS: AutoGlossarySettings = {
	fileInclusion: false,
	sameDest: true,
	fileDest: "",
	fileOverwrite: false,
	fileOrder: "default",
	indexPattern: "{{folder}}_Index",
	glossaryPattern: "{{folder}}_Glossary",
	glossaryIndexPattern: "{{folder}}_GlossaryIndex",
};

export class SettingTab extends PluginSettingTab {
	plugin: AutoGlossaryPlugin;

	constructor(app: App, plugin: AutoGlossaryPlugin) {
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
				"Include previously generated Auto Glossary files in newly created indexes and glossaries."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fileInclusion)
					.onChange(async (value) => {
						this.plugin.settings.fileInclusion = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Default options" });

		let destinationTextSetting: Setting | undefined;

		new Setting(containerEl)
			.setName("Same destination as folder")
			.setDesc(
				"If on, files will be created in the target folder and the 'Destination' field will be disabled."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.sameDest)
					.onChange(async (value) => {
						this.plugin.settings.sameDest = value;
						if (value) {
							this.plugin.settings.fileDest = "";
						}
						destinationTextSetting?.setDisabled(value);
						await this.plugin.saveSettings();
					})
			);

		destinationTextSetting = new Setting(containerEl)
			.setName("Destination")
			.setDesc(
				"If 'Same destination as folder' is off, specify the custom destination folder for created files."
			)
			.addText((destText) =>
				destText
					.setPlaceholder("e.g. Glossaries/Indices")
					.setValue(this.plugin.settings.fileDest)
					.onChange(async (value) => {
						this.plugin.settings.fileDest = value.trim();
						await this.plugin.saveSettings();
					})
			)
			.setDisabled(this.plugin.settings.sameDest);

		new Setting(containerEl)
			.setName("Overwrite existing files")
			.setDesc(
				"Set the default overwrite behavior when a file with the same name already exists."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fileOverwrite)
					.onChange(async (value) => {
						this.plugin.settings.fileOverwrite = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File order")
			.setDesc("The default sort order for notes in generated files.")
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
					.addOption("alphabetical", "Alphabetical (A-Z)")
					.addOption("alphabetical_rev", "Alphabetical (Z-A)")
					.setValue(this.plugin.settings.fileOrder)
					.onChange(async (chosen) => {
						this.plugin.settings.fileOrder = chosen;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Filename patterns" });

		new Setting(containerEl)
			.setName("Index filename pattern")
			.setDesc(
				"Default pattern for index filenames. Use {{folder}} as placeholder for the folder name."
			)
			.addText((text) =>
				text
					.setPlaceholder("{{folder}}_Index")
					.setValue(this.plugin.settings.indexPattern)
					.onChange(async (value) => {
						this.plugin.settings.indexPattern = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Glossary filename pattern")
			.setDesc(
				"Default pattern for glossary filenames. Use {{folder}} as placeholder for the folder name."
			)
			.addText((text) =>
				text
					.setPlaceholder("{{folder}}_Glossary")
					.setValue(this.plugin.settings.glossaryPattern)
					.onChange(async (value) => {
						this.plugin.settings.glossaryPattern = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Combined filename pattern")
			.setDesc(
				"Default pattern for combined index & glossary filenames. Use {{folder}} as placeholder for the folder name."
			)
			.addText((text) =>
				text
					.setPlaceholder("{{folder}}_GlossaryIndex")
					.setValue(this.plugin.settings.glossaryIndexPattern)
					.onChange(async (value) => {
						this.plugin.settings.glossaryIndexPattern = value.trim();
						await this.plugin.saveSettings();
					})
			);
	}
}


