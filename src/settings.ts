import AutoGlossaryPlugin from "./main";
import { App, PluginSettingTab, Setting, SettingDefinitionItem } from "obsidian";

export interface AutoGlossarySettings {
	fileInclusion: boolean;
	sameDest: boolean;
	fileDest: string;
	fileOverwrite: boolean;
	fileOrder: string;
	indexPattern: string;
	glossaryPattern: string;
	glossaryIndexPattern: string;
	indexTemplate: string;
	glossaryTemplate: string;
	glossaryIndexTemplate: string;
	includeSubfolders: boolean;
	includeEmptyFolders: boolean;
	includeNonMarkdown: boolean;
	nonMarkdownExtensions: string;
	excludedTags: string;
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
	indexTemplate: "",
	glossaryTemplate: "",
	glossaryIndexTemplate: "",
	includeSubfolders: true,
	includeEmptyFolders: false,
	includeNonMarkdown: false,
	nonMarkdownExtensions: "pdf, png, jpg, jpeg, canvas",
	excludedTags: "",
};

export class SettingTab extends PluginSettingTab {
	plugin: AutoGlossaryPlugin;

	constructor(app: App, plugin: AutoGlossaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				type: "group",
				heading: "Inclusion & Subfolders",
				items: [
					{
						name: "Include Auto Glossary files",
						desc: "Include previously generated Auto Glossary files in newly created indexes and glossaries.",
						control: {
							type: "toggle",
							key: "fileInclusion",
						},
					},
					{
						name: "Excluded tags",
						desc: "Comma-separated list of tags to exclude from generated files (e.g. 'draft, #archive, private').",
						control: {
							type: "text",
							key: "excludedTags",
							placeholder: "e.g. draft, archive, private",
						},
					},
					{
						name: "Include subfolders",
						desc: "Recursively index subdirectories with section headings. If off, only direct files in the target folder will be indexed.",
						control: {
							type: "toggle",
							key: "includeSubfolders",
						},
					},
					{
						name: "Include empty folders",
						desc: "Include empty subfolders in generated indexes as list items.",
						control: {
							type: "toggle",
							key: "includeEmptyFolders",
						},
					},
					{
						name: "Include non-markdown files",
						desc: "Include non-markdown attachments and files (e.g. PDF, images, canvas) in indexes and glossaries.",
						control: {
							type: "toggle",
							key: "includeNonMarkdown",
						},
					},
					{
						name: "Allowed non-markdown extensions",
						desc: "Comma-separated list of allowed file extensions (e.g. 'pdf, png, jpg, canvas'). Leave empty to include all.",
						control: {
							type: "text",
							key: "nonMarkdownExtensions",
							placeholder: "pdf, png, jpg, jpeg, canvas",
							disabled: () => !this.plugin.settings.includeNonMarkdown,
						},
					},
				],
			},
			{
				type: "group",
				heading: "Defaults",
				items: [
					{
						name: "Same destination as folder",
						desc: "If on, files will be created in the target folder and the 'Destination' field will be disabled.",
						control: {
							type: "toggle",
							key: "sameDest",
						},
					},
					{
						name: "Destination",
						desc: "If 'Same destination as folder' is off, specify the custom destination folder for created files.",
						control: {
							type: "text",
							key: "fileDest",
							placeholder: "e.g. Glossaries/Indices",
							disabled: () => this.plugin.settings.sameDest,
						},
					},
					{
						name: "Overwrite existing files",
						desc: "Set the default overwrite behavior when a file with the same name already exists.",
						control: {
							type: "toggle",
							key: "fileOverwrite",
						},
					},
					{
						name: "File order",
						desc: "The default sort order for notes in generated files.",
						control: {
							type: "dropdown",
							key: "fileOrder",
							options: {
								default: "Default",
								mtime_new: "Modification time - Newest to oldest",
								mtime_old: "Modification time - Oldest to newest",
								ctime_new: "Creation time - Newest to oldest",
								ctime_old: "Creation time - Oldest to newest",
								alphabetical: "Alphabetical (A-Z)",
								alphabetical_rev: "Alphabetical (Z-A)",
							},
						},
					},
				],
			},
			{
				type: "group",
				heading: "Filename patterns",
				items: [
					{
						name: "Index filename pattern",
						desc: "Default pattern for index filenames. Use {{folder}} as placeholder for the folder name.",
						control: {
							type: "text",
							key: "indexPattern",
							placeholder: "{{folder}}_Index",
						},
					},
					{
						name: "Glossary filename pattern",
						desc: "Default pattern for glossary filenames. Use {{folder}} as placeholder for the folder name.",
						control: {
							type: "text",
							key: "glossaryPattern",
							placeholder: "{{folder}}_Glossary",
						},
					},
					{
						name: "Combined filename pattern",
						desc: "Default pattern for combined index & glossary filenames. Use {{folder}} as placeholder for the folder name.",
						control: {
							type: "text",
							key: "glossaryIndexPattern",
							placeholder: "{{folder}}_GlossaryIndex",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Templates",
				items: [
					{
						name: "Index template",
						desc: "Vault path to a markdown template file for index notes. Placeholders: {{content}}, {{index}}, {{folder}}, {{title}}, {{date}}, {{time}}.",
						control: {
							type: "text",
							key: "indexTemplate",
							placeholder: "e.g. Templates/IndexTemplate.md",
						},
					},
					{
						name: "Glossary template",
						desc: "Vault path to a markdown template file for glossary notes. Placeholders: {{content}}, {{glossary}}, {{folder}}, {{title}}, {{date}}, {{time}}.",
						control: {
							type: "text",
							key: "glossaryTemplate",
							placeholder: "e.g. Templates/GlossaryTemplate.md",
						},
					},
					{
						name: "Combined template",
						desc: "Vault path to a markdown template file for combined index & glossary notes. Placeholders: {{content}}, {{index}}, {{glossary}}, {{folder}}, {{title}}, {{date}}, {{time}}.",
						control: {
							type: "text",
							key: "glossaryIndexTemplate",
							placeholder: "e.g. Templates/CombinedTemplate.md",
						},
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return (this.plugin.settings as unknown as Record<string, unknown>)[key];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		if (typeof value === "string") {
			value = value.trim();
		}
		(this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
		if (key === "sameDest" && value === true) {
			this.plugin.settings.fileDest = "";
		}
		await this.plugin.saveSettings();
		this.refreshDomState?.();
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Inclusion & Subfolders").setHeading();

		new Setting(containerEl)
			.setName("Include Auto Glossary files")
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

		new Setting(containerEl)
			.setName("Excluded tags")
			.setDesc(
				"Comma-separated list of tags to exclude from generated files (e.g. 'draft, #archive, private')."
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. draft, archive, private")
					.setValue(this.plugin.settings.excludedTags)
					.onChange(async (value) => {
						this.plugin.settings.excludedTags = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include subfolders")
			.setDesc(
				"Recursively index subdirectories with section headings. If off, only direct files in the target folder will be indexed."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeSubfolders)
					.onChange(async (value) => {
						this.plugin.settings.includeSubfolders = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include empty folders")
			.setDesc(
				"Include empty subfolders in generated indexes as list items."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeEmptyFolders)
					.onChange(async (value) => {
						this.plugin.settings.includeEmptyFolders = value;
						await this.plugin.saveSettings();
					})
			);

		let nonMarkdownExtensionsSetting: Setting | undefined;

		new Setting(containerEl)
			.setName("Include non-markdown files")
			.setDesc(
				"Include non-markdown attachments and files (e.g. PDF, images, canvas) in indexes and glossaries."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeNonMarkdown)
					.onChange(async (value) => {
						this.plugin.settings.includeNonMarkdown = value;
						nonMarkdownExtensionsSetting?.setDisabled(!value);
						await this.plugin.saveSettings();
					})
			);

		nonMarkdownExtensionsSetting = new Setting(containerEl)
			.setName("Allowed non-markdown extensions")
			.setDesc(
				"Comma-separated list of allowed file extensions (e.g. 'pdf, png, jpg, canvas'). Leave empty to include all."
			)
			.addText((text) =>
				text
					.setPlaceholder("pdf, png, jpg, jpeg, canvas")
					.setValue(this.plugin.settings.nonMarkdownExtensions)
					.onChange(async (value) => {
						this.plugin.settings.nonMarkdownExtensions = value.trim();
						await this.plugin.saveSettings();
					})
			)
			.setDisabled(!this.plugin.settings.includeNonMarkdown);

		new Setting(containerEl).setName("Defaults").setHeading();

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

		new Setting(containerEl).setName("Filename patterns").setHeading();

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

		new Setting(containerEl).setName("Templates").setHeading();

		new Setting(containerEl)
			.setName("Index template")
			.setDesc(
				"Vault path to a markdown template file for index notes. Placeholders: {{content}}, {{index}}, {{folder}}, {{title}}, {{date}}, {{time}}."
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. Templates/IndexTemplate.md")
					.setValue(this.plugin.settings.indexTemplate)
					.onChange(async (value) => {
						this.plugin.settings.indexTemplate = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Glossary template")
			.setDesc(
				"Vault path to a markdown template file for glossary notes. Placeholders: {{content}}, {{glossary}}, {{folder}}, {{title}}, {{date}}, {{time}}."
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. Templates/GlossaryTemplate.md")
					.setValue(this.plugin.settings.glossaryTemplate)
					.onChange(async (value) => {
						this.plugin.settings.glossaryTemplate = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Combined template")
			.setDesc(
				"Vault path to a markdown template file for combined index & glossary notes. Placeholders: {{content}}, {{index}}, {{glossary}}, {{folder}}, {{title}}, {{date}}, {{time}}."
			)
			.addText((text) =>
				text
					.setPlaceholder("e.g. Templates/CombinedTemplate.md")
					.setValue(this.plugin.settings.glossaryIndexTemplate)
					.onChange(async (value) => {
						this.plugin.settings.glossaryIndexTemplate = value.trim();
						await this.plugin.saveSettings();
					})
			);
	}
}


