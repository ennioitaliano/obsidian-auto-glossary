import { App, Modal, Setting } from "obsidian";
import { fileType } from "utils";

export class CreateFileModal extends Modal {
	option: string;
	overwrite: boolean;
	fileName: string;
	chosenFolder: string;
	fileOrder: string;
	destFolder: string;

	onSubmit: (
		option: string,
		overwrite: boolean,
		fileName?: string,
		chosenFolder?: string,
		fileOrder?: string,
		destFolder?: string
	) => void;

	constructor(
		app: App,
		overwrite: boolean,
		onSubmit: (
			option: string,
			overwrite: boolean,
			fileName: string,
			chosenFolder: string,
			fileOrder: string,
			destFolder: string
		) => void,
		passedFolder?: string,
		passedName?: string,
		passedOption?: string
	) {
		super(app);
		this.onSubmit = onSubmit;
		this.overwrite = overwrite;
		this.chosenFolder = passedFolder ? passedFolder : "";
		this.fileName = passedName ? passedName : "";
		this.option = passedOption ? passedOption : "";
	}

	onOpen() {
		console.log(this.overwrite);

		const { contentEl } = this;

		contentEl.createEl("h1", { text: "AutoGlossary" });

		new Setting(contentEl)
			.setName("Folder")
			.setDesc("The folder to get the files indexed from.")
			.addText((text) =>
				text
					.onChange((value) => {
						this.chosenFolder = value;
					})
					.setValue(this.chosenFolder)
			);

		new Setting(contentEl)
			.setName("Same destination as folder")
			.setDesc(
				"If on, the file will be created in the same folder specified above and the 'Destination' field will be disabled."
			)
			.addToggle((toggle) =>
				toggle.setValue(true).onChange((value) => {
					destination.setDisabled(value);
					if (value) {
						this.destFolder = this.chosenFolder;
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
					.onChange((value) => {
						this.destFolder = value;
					})
					.setValue(this.destFolder)
					.setDisabled(true)
			)
			.setDisabled(true);

		new Setting(contentEl)
			.setName("File name")
			.setDesc("The name of the created file.")
			.addText((text) =>
				text
					.onChange((value) => {
						this.fileName = value;
					})
					.setValue(this.fileName)
			);

		new Setting(contentEl)
			.setName("Overwrite existing file")
			.setDesc(
				"If turned on, if a file with the same name and location already exists, it will be overwritten. Default behavior can be changed in the plugin settings."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.overwrite).onChange((value) => {
					this.overwrite = value;
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
					.setValue("default")
					.onChange((chosen) => {
						this.fileOrder = chosen;
					})
			);

		new Setting(contentEl)
			.setName("File type")
			.setDesc("Choose between index, glossary or both.")
			.addDropdown((drop) =>
				drop
					.addOption(fileType.g, "Glossary")
					.addOption(fileType.i, "Index")
					.addOption(fileType.gi, "Glossary with index")
					.onChange((chosen) => {
						this.option = chosen;
					})
					.setValue(this.option ? this.option : fileType.gi)
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					if (!this.fileName) {
						this.fileName = this.option;
					}

					this.close();

					this.onSubmit(
						this.option,
						this.overwrite,
						this.fileName,
						this.chosenFolder,
						this.fileOrder,
						this.destFolder
					);
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
