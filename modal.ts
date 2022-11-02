import { App, Modal, Notice, Setting } from "obsidian";
import { fileExists } from "utils";

export class CreateFileModal extends Modal {
	fileName: string;
	chosenFolder: string;
	option: string;
	onSubmit: (
		option: string,
		fileName?: string,
		chosenFolder?: string,
		fileOrder?: string,
		destFolder?: string
	) => void;
	fileOrder: string;
	destFolder: string;

	constructor(
		app: App,
		onSubmit: (
			option: string,
			fileName: string,
			chosenFolder: string,
			fileOrder: string,
			destFolder: string
		) => void,
		passedFolder?: string,
		passedName?: string,
		passedOption?: string,
		passedDestFolder?: string
	) {
		super(app);
		this.onSubmit = onSubmit;
		this.chosenFolder = passedFolder ? passedFolder : "";
		this.fileName = passedName ? passedName : "";
		this.option = passedOption ? passedOption : "";
		this.destFolder = passedDestFolder ? passedDestFolder : "";
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "AutoGlossary" });

		new Setting(contentEl).setName("Folder").addText((text) =>
			text
				.onChange((value) => {
					this.chosenFolder = value;
				})
				.setValue(this.chosenFolder)
		);

		new Setting(contentEl).setName("Same destination").addToggle((toggle) =>
			toggle.setValue(true).onChange((value) => {
				destination.settingEl.toggleVisibility(!value);
			})
		);

		let destination = new Setting(contentEl);

		destination
			.setName("Destination")
			.addText((text) =>
				text
					.onChange((value) => {
						this.destFolder = value;
					})
					.setValue(this.destFolder)
			)
			.settingEl.toggleVisibility(false);

		new Setting(contentEl).setName("File name").addText((text) =>
			text
				.onChange((value) => {
					this.fileName = value;
				})
				.setValue(this.fileName)
		);

		new Setting(contentEl).setName("File order").addDropdown((drop) =>
			drop
				.addOption("", "File order")
				.addOption("default", "Default")
				.addOption("mtime_new", "Modification time - Newest to oldest")
				.addOption("mtime_old", "Modification time - Oldest to newest")
				.addOption("ctime_new", "Creation time - Newest to oldest")
				.addOption("ctime_old", "Creation time - Oldest to newest")
				.addOption("alphabetical", "Alphabetical")
				.addOption("alphabetical_rev", "Alphabetical - Reverse")
				.onChange((chosen) => {
					this.fileOrder = chosen;
				})
		);

		new Setting(contentEl).setName("File type").addDropdown((drop) =>
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
							this.fileOrder
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
