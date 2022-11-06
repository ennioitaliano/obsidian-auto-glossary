import { App, Modal, Notice, Setting } from "obsidian";
import { fileExists } from "utils";

export class CreateFileModal extends Modal {
	option: string;
	fileName: string;
	chosenFolder: string;
	fileOrder: string;
	destFolder: string;
	dvField: string;
	onSubmit: (
		option: string,
		fileName?: string,
		chosenFolder?: string,
		fileOrder?: string,
		destFolder?: string,
		dvField?: string
	) => void;

	constructor(
		app: App,
		onSubmit: (
			option: string,
			fileName: string,
			chosenFolder: string,
			fileOrder: string,
			destFolder: string,
			dvField: string
		) => void,
		passedFolder?: string,
		passedName?: string,
		passedOption?: string
	) {
		super(app);
		this.onSubmit = onSubmit;
		this.chosenFolder = passedFolder ? passedFolder : "";
		this.fileName = passedName ? passedName : "";
		this.option = passedOption ? passedOption : "";
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "AutoGlossary" });

		new Setting(contentEl).setName("Folder").setDesc("The folder to get the files indexed from.").addText((text) =>
			text
				.onChange((value) => {
					this.chosenFolder = value;
				})
				.setValue(this.chosenFolder)
		);

		new Setting(contentEl).setName("Same destination as folder").setDesc("If on, the file will be created in the same folder specified above and the 'Destination' field will be disabled.").addToggle((toggle) =>
			toggle.setValue(true).onChange((value) => {
				destination.setDisabled(value);
				if (value) {
					this.destFolder = this.chosenFolder;
				}
			})
		);

		let destination = new Setting(contentEl);

		destination
			.setName("Destination")
			.setDesc("If the toggle above is on, specify here the destination folder for the file created.")
			.addText((text) =>
				text
					.onChange((value) => {
						this.destFolder = value;
					})
					.setValue(this.destFolder)
					.setDisabled(true)
			)
			.setDisabled(true);

		new Setting(contentEl).setName("File name").setDesc("The name of the created file.").addText((text) =>
			text
				.onChange((value) => {
					this.fileName = value;
				})
				.setValue(this.fileName)
		);

		new Setting(contentEl).setName("File order").setDesc("The order for the files to be indexed.").addDropdown((drop) =>
			drop
				.addOption("", "File order")
				.addOption("default", "Default")
				.addOption("mtime_new", "Modification time - Newest to oldest")
				.addOption("mtime_old", "Modification time - Oldest to newest")
				.addOption("ctime_new", "Creation time - Newest to oldest")
				.addOption("ctime_old", "Creation time - Oldest to newest")
				.addOption("alphabetical", "Alphabetical")
				.addOption("alphabetical_rev", "Alphabetical - Reverse")
				.setValue("default")
				.onChange((chosen) => {
					this.fileOrder = chosen;
				})
		);

		new Setting(contentEl).setName("File type").setDesc("Choose between index, glossary or both.").addDropdown((drop) =>
			drop
				.addOption("", "File type") // have to do this in order to get some value != undefined
				.addOption("glossary", "Glossary")
				.addOption("index", "Index")
				.addOption("glossaryindex", "Both")
				.onChange((chosen) => {
					this.option = chosen;
				})
				.setValue(this.option)
		);

		new Setting(contentEl).setName("Dataview").setDesc("If on, you can create the file using Dataview queries.").addToggle((toggle) =>
			toggle.setValue(false).onChange((value) => {
				dvfield.setDisabled(!value);
			})
		);

		let dvfield = new Setting(contentEl);

		dvfield
			.setName("Dataview field")
			.addText((text) =>
				text
					.onChange((value) => {
						this.dvField = value;
					})
					.setValue(this.dvField)
			)
			.setDisabled(true);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					if (!this.fileName) {
						this.fileName = this.option;
					}

					if (!fileExists(this.fileName)) {
						this.close();
						this.onSubmit(
							this.option,
							this.fileName,
							this.chosenFolder,
							this.fileOrder,
							this.destFolder
						);
					}
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
