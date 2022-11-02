import { App, Modal, Notice, Setting } from "obsidian";
import { fileExists } from "utils";

export class CreateFileModal extends Modal {
	fileName: string;
	chosenFolder: string;
	option: string;
	onSubmit: (
		option: string,
		fileName?: string,
		chosenFolder?: string
	) => void;

	constructor(
		app: App,
		onSubmit: (
			option: string,
			fileName: string,
			chosenFolder: string
		) => void
	) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "AutoGlossary" });

		new Setting(contentEl).setName("Folder").addText((text) =>
			text.onChange((value) => {
				this.chosenFolder = value;
			})
		);

		new Setting(contentEl).setName("File name").addText((text) =>
			text.onChange((value) => {
				this.fileName = value;
			})
		);

		new Setting(contentEl).addDropdown((drop) =>
			drop
				.addOption("", "File type") // have to do this in order to get some value != undefined
				.addOption("glossary", "Glossary")
				.addOption("index", "Index")
				.addOption("glossaryindex", "Both")
				.onChange((chosen) => {
					this.option = chosen;
				})
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
							this.chosenFolder
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
