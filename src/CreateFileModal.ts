import { GeneratedFile } from "GeneratedFile";
import { App, Modal, Setting, TFolder } from "obsidian";
import { AutoGlossarySettings } from "settings";
import { FileType, NotesOrder } from "utils";

export class CreateFileModal extends Modal {
	option: FileType;
	sameDest: boolean;

	fileToGenerate: GeneratedFile;

	onSubmit: (fileToGenerate: GeneratedFile) => void;

	constructor(
		app: App,
		settings: AutoGlossarySettings,
		fileToGenerate: GeneratedFile,
		onSubmit: (fileToGenerate: GeneratedFile) => void
	) {
		super(app);
		this.onSubmit = onSubmit;
		this.sameDest = settings.sameDest;
		this.fileToGenerate = fileToGenerate;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "AutoGlossary" });

		new Setting(contentEl).setName(
			"Folder: " + this.fileToGenerate.ChosenFolder.path
		);
		/*.setDesc("The folder to get the files indexed from.")
		.addText((text) =>
				text
					.onChange((value) => {
						this.chosenFolder = value;
					})
					.setValue(this.chosenFolder)
			);*/

		new Setting(contentEl)
			.setName("Same destination as folder")
			.setDesc(
				"If on, the file will be created in the same folder specified above and the 'Destination' field will be disabled."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.sameDest).onChange((value) => {
					this.sameDest = value;
					destination.setDisabled(value);
					if (value) {
						this.fileToGenerate.DestFolder =
							this.fileToGenerate.ChosenFolder;
					}
				})
			);

		const destination = new Setting(contentEl);

		destination
			.setName("Destination")
			.setDesc(
				"If the above toggle is off, specify here the destination folder for the file created."
			)
			.addText((text) =>
				text
					.setValue(
						this.fileToGenerate.DestFolder
							? this.fileToGenerate.DestFolder.path
							: this.fileToGenerate.ChosenFolder.path
					)
					.onChange((value) => {
						this.fileToGenerate.DestFolder =
							app.vault.getAbstractFileByPath(value) as TFolder;

						console.log(this.fileToGenerate.DestFolder);
					})
					.setDisabled(true)
			)
			.setDisabled(this.sameDest);

		new Setting(contentEl)
			.setName("File name")
			.setDesc("The name of the created file.")
			.addText((text) =>
				text.setValue(this.fileToGenerate.Name).onChange((value) => {
					this.fileToGenerate.Name = value;
				})
			);

		new Setting(contentEl)
			.setName("Files inclusion")
			.setDesc(
				"Include files generated with AutoGlossary in new glossaries and indexes."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.fileToGenerate.IncludeFiles)
					.onChange((value) => {
						this.fileToGenerate.IncludeFiles = value;
					})
			);

		new Setting(contentEl)
			.setName("Overwrite existing file")
			.setDesc(
				"If turned on, if a file with the same name and location already exists, it will be overwritten. Default behavior can be changed in the plugin settings."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.fileToGenerate.Overwrite)
					.onChange((value) => {
						this.fileToGenerate.Overwrite = value;
					})
			);

		new Setting(contentEl)
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
					.setValue(this.fileToGenerate.NotesOrder)
					.onChange((chosen: NotesOrder) => {
						this.fileToGenerate.NotesOrder = chosen;
					})
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					if (!this.fileToGenerate.Name) {
						this.fileToGenerate.Name = this.option;
					}

					this.close();

					this.onSubmit(this.fileToGenerate);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
