import { App, Modal, Setting } from "obsidian";

export class CreateFileModal extends Modal {
	fileName: string;
	option: string;
	onSubmit: (option: string, fileName?: string) => void;

	constructor(
		app: App,
		onSubmit: (option: string, fileName: string) => void
	) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Name your file" });

		new Setting(contentEl).setName("File name").addText((text) =>
			text.onChange((value) => {
				this.fileName = value;
			})
		);

		new Setting(contentEl).addDropdown((drop) =>
			drop
                // have to do this in order to get some value != undefined
				.addOption("", "CHANGE ME")
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
					this.close();
					this.onSubmit(this.option, this.fileName);
				})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
