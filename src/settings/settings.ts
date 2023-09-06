import autoGlossary from "old/main_OLD";
import { App, PluginSettingTab, Setting } from "obsidian";
import { NotesOrder } from "../old/modules_OLD";
import { FolderSuggest } from "./folder_suggester";

export interface AutoGlossarySettings {
	filesInclusion: boolean;
	sameDest: boolean;
	destination: string;
	fileOverwrite: boolean;
	fileOrder: NotesOrder;
}

export const DEFAULT_SETTINGS: AutoGlossarySettings = {
	filesInclusion: false,
	sameDest: true,
	destination: "",
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
		this.containerEl.empty();

		this.createHeader();
		this.createSettingsDescription();
		this.createFileInclusionSetting();
		this.createDestinationSetting();
		this.createOverwriteFilesSetting();
		this.createFileOrderSetting();
		this.createResetToDefaultButton();
	}

	private createHeader(): void {
		this.containerEl.createEl("h2", { text: "Auto Glossary Settings" });
	}

	private createSettingsDescription(): void {
		this.containerEl.createEl("p", {
			text: "These settings will be applied during the quick generation of a file with this plugin. You can use different values from the advanced generation.",
		});
	}

	private createFileInclusionSetting(): void {
		new Setting(this.containerEl)
			.setName("Files inclusion")
			.setDesc("Include files generated with this plugin in new ones.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.filesInclusion)
					.onChange(async (value) => {
						this.plugin.settings.filesInclusion = value;
						await this.plugin.saveSettings();
					})
			);
	}

	private createDestinationSetting(): void {
		new Setting(this.containerEl)
			.setName("Same destination as folder")
			.setDesc(
				"If on, files will be created in the same folder specified above and the 'Destination' field will be disabled."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.sameDest)
					.onChange(async (value) => {
						this.plugin.settings.sameDest = value;
						if (value) {
							this.plugin.settings.destination = "";
						}
						destination.setDisabled(value);
						await this.plugin.saveSettings();
					})
			);

		const destination = new Setting(this.containerEl);

		destination
			.setName("Destination")
			.setDesc(
				"If the above toggle is off, specify here the destination folder for the files created."
			)
			// add text field to search through the folders to select one
			.addText((cb) => {
				new FolderSuggest(cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.destination)
					.onChange((new_folder) => {
						this.plugin.settings.destination = new_folder;
						this.plugin.saveSettings();
					})
					.setValue(this.plugin.settings.destination)
					.setDisabled(this.plugin.settings.sameDest);
			});
	}

	private createOverwriteFilesSetting(): void {
		new Setting(this.containerEl)
			.setName("Overwrite existing files")
			.setDesc("If on, files with the same name will be overwritten.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.fileOverwrite)
					.onChange(async (value) => {
						this.plugin.settings.fileOverwrite = value;
						await this.plugin.saveSettings();
					})
			);
	}

	private createFileOrderSetting(): void {
		new Setting(this.containerEl)
			.setName("File order")
			.setDesc("The order for the notes in the generated file.")
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
					.onChange(async (chosen: NotesOrder) => {
						this.plugin.settings.fileOrder = chosen;
						await this.plugin.saveSettings();
					})
			);
	}

	private createResetToDefaultButton(): void {
		new Setting(this.containerEl)
			.setName("Reset to default")
			.setDesc("Reset plugin settings to the default values.")
			.addButton((button) =>
				button.setButtonText("Reset").onClick(async () => {
					Object.assign(this.plugin.settings, DEFAULT_SETTINGS);
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
