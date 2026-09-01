import { App, Modal, Setting } from "obsidian";
import { FileOrder, FileType } from "./utils";

export class CreateFileModal extends Modal {
	option: string;
	overwrite: boolean;
	sameDest: boolean;
	fileName: string;
	chosenFolder: string;
	fileOrder: string;
	destFolder: string;

	onSubmit: (
		option: string,
		overwrite: boolean,
		fileName: string,
		chosenFolder: string,
		fileOrder: string,
		destFolder: string
	) => void;

	constructor(
		app: App,
		overwrite: boolean,
		sameDest: boolean,
		destFolder: string,
		fileOrder: string,
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
		this.sameDest = sameDest;
		this.destFolder = destFolder ? destFolder : "";
		this.fileOrder = fileOrder ? fileOrder : FileOrder.Default;
		this.chosenFolder = passedFolder ? passedFolder : "";
		this.fileName = passedName ? passedName : "";
		this.option = passedOption ? passedOption : FileType.GlossaryIndex;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Auto Glossary: Generate File" });

		new Setting(contentEl)
			.setName("Source Folder")
			.setDesc(
				this.chosenFolder
					? `Files in "${this.chosenFolder}" will be indexed.`
					: "Vault root (all notes)."
			);

		let destinationSetting: Setting | undefined;

		new Setting(contentEl)
			.setName("Same destination as folder")
			.setDesc(
				"If enabled, the file will be created inside the source folder. Otherwise, specify a custom destination below."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.sameDest).onChange((value) => {
					this.sameDest = value;
					destinationSetting?.setDisabled(value);
					if (value) {
						this.destFolder = this.chosenFolder;
					}
				})
			);

		destinationSetting = new Setting(contentEl)
			.setName("Destination Folder")
			.setDesc("The folder where the generated file will be saved.")
			.addText((text) =>
				text
					.setPlaceholder("e.g. Glossaries/Indices")
					.setValue(this.destFolder)
					.onChange((value) => {
						this.destFolder = value.trim();
					})
			)
			.setDisabled(this.sameDest);

		new Setting(contentEl)
			.setName("File Name")
			.setDesc("The name of the created note (without .md extension).")
			.addText((text) =>
				text
					.setPlaceholder(this.fileName || "Index")
					.setValue(this.fileName)
					.onChange((value) => {
						this.fileName = value.trim();
					})
			);

		new Setting(contentEl)
			.setName("Overwrite existing file")
			.setDesc(
				"If enabled, any existing file with the same name will be overwritten."
			)
			.addToggle((toggle) =>
				toggle.setValue(this.overwrite).onChange((value) => {
					this.overwrite = value;
				})
			);

		new Setting(contentEl)
			.setName("File Order")
			.setDesc("Order in which notes are listed.")
			.addDropdown((drop) =>
				drop
					.addOption(FileOrder.Default, "Default (Vault order)")
					.addOption(
						FileOrder.MtimeNew,
						"Modification time - Newest to oldest"
					)
					.addOption(
						FileOrder.MtimeOld,
						"Modification time - Oldest to newest"
					)
					.addOption(
						FileOrder.CtimeNew,
						"Creation time - Newest to oldest"
					)
					.addOption(
						FileOrder.CtimeOld,
						"Creation time - Oldest to newest"
					)
					.addOption(FileOrder.Alphabetical, "Alphabetical (A-Z)")
					.addOption(FileOrder.AlphabeticalRev, "Alphabetical (Z-A)")
					.setValue(this.fileOrder)
					.onChange((chosen) => {
						this.fileOrder = chosen;
					})
			);

		new Setting(contentEl)
			.setName("File Type")
			.setDesc("Choose between Index (MOC), Glossary, or combined Index+Glossary.")
			.addDropdown((drop) =>
				drop
					.addOption(FileType.GlossaryIndex, "Glossary with Index")
					.addOption(FileType.Index, "Index only")
					.addOption(FileType.Glossary, "Glossary only")
					.setValue(this.option ? this.option : FileType.GlossaryIndex)
					.onChange((chosen) => {
						this.option = chosen;
					})
			);

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Generate")
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

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}


