// import { App, Modal, Setting } from "obsidian";
// import { AutoGlossarySettings, FileType, NotesOrder, GeneratedFile } from "old/modules_OLD";

// export class CreateFileModal extends Modal {
// 	option: FileType;
// 	sameDest: boolean;

// 	fileToGenerate: GeneratedFile;

// 	onSubmit: (fileToGenerate: GeneratedFile) => void;

// 	constructor(
// 		app: App,
// 		settings: AutoGlossarySettings,
// 		fileToGenerate: GeneratedFile,
// 		onSubmit: (fileToGenerate: GeneratedFile) => void
// 	) {
// 		super(app);
// 		this.onSubmit = onSubmit;
// 		this.sameDest = settings.sameDest;
// 		this.fileToGenerate = fileToGenerate;
// 	}

// 	onOpen() {
// 		// const { contentEl } = this;

// 		this.header();
// 		// this.description();
// 		this.folder();
// 		this.destination();
// 		this.name();
// 		this.filesInclusion();
// 		this.filesOverwrite();
// 		this.notesOrder();
// 		this.generate();
// 	}

// 	private header(): void {
// 		this.contentEl.createEl("h1", { text: "AutoGlossary" });
// 	}

// 	private folder(): void {
// 		new Setting(this.contentEl).setName(
// 			"Folder: " + this.fileToGenerate.Folder.path
// 		);
// 	}

// 	private destination(): void {
// 		new Setting(this.contentEl)
// 			.setName("Same destination as folder")
// 			.setDesc(
// 				"If on, the file will be created in the same folder specified above and the 'Destination' field will be disabled."
// 			)
// 			.addToggle((toggle) =>
// 				toggle.setValue(this.sameDest).onChange((value) => {
// 					this.sameDest = value;
// 					destination.setDisabled(value);
// 					if (value) {
// 						this.fileToGenerate.Settings.destination =
// 							this.fileToGenerate.Folder.path;
// 					}
// 				})
// 			);

// 		const destination = new Setting(this.contentEl);

// 		destination
// 			.setName("Destination")
// 			.setDesc(
// 				"If the above toggle is off, specify here the destination folder for the file created."
// 			)
// 			.addText((text) =>
// 				text
// 					.setValue(
// 						this.fileToGenerate.Settings.destination
// 							? this.fileToGenerate.Settings.destination
// 							: this.fileToGenerate.Folder.path
// 					)
// 					.onChange((value) => {
// 						this.fileToGenerate.Settings.destination = value;
// 						// = app.vault.getAbstractFileByPath(value) as TFolder;
// 					})
// 					.setDisabled(true)
// 			)
// 			.setDisabled(this.sameDest);
// 	}

// 	private name(): void {
// 		new Setting(this.contentEl)
// 			.setName("File name")
// 			.setDesc("The name of the created file.")
// 			.addText((text) =>
// 				text.setValue(this.fileToGenerate.Name).onChange((value) => {
// 					this.fileToGenerate.Name = value;
// 				})
// 			);
// 	}

// 	private filesInclusion(): void {
// 		new Setting(this.contentEl)
// 			.setName("Files inclusion")
// 			.setDesc(
// 				"Include files generated with AutoGlossary in new glossaries and indexes."
// 			)
// 			.addToggle((toggle) =>
// 				toggle
// 					.setValue(this.fileToGenerate.Settings.filesInclusion)
// 					.onChange((value) => {
// 						this.fileToGenerate.Settings.filesInclusion = value;
// 					})
// 			);
// 	}

// 	private filesOverwrite(): void {
// 		new Setting(this.contentEl)
// 			.setName("Overwrite existing file")
// 			.setDesc(
// 				"If turned on, if a file with the same name and location already exists, it will be overwritten. Default behavior can be changed in the plugin settings."
// 			)
// 			.addToggle((toggle) =>
// 				toggle
// 					.setValue(this.fileToGenerate.Settings.fileOverwrite)
// 					.onChange((value) => {
// 						this.fileToGenerate.Settings.fileOverwrite = value;
// 					})
// 			);
// 	}

// 	private notesOrder(): void {
// 		new Setting(this.contentEl)
// 			.setName("File order")
// 			.setDesc("The order for the files to be indexed.")
// 			.addDropdown((drop) =>
// 				drop
// 					.addOption("default", "Default")
// 					.addOption(
// 						"mtime_new",
// 						"Modification time - Newest to oldest"
// 					)
// 					.addOption(
// 						"mtime_old",
// 						"Modification time - Oldest to newest"
// 					)
// 					.addOption("ctime_new", "Creation time - Newest to oldest")
// 					.addOption("ctime_old", "Creation time - Oldest to newest")
// 					.addOption("alphabetical", "Alphabetical")
// 					.addOption("alphabetical_rev", "Alphabetical - Reverse")
// 					.setValue(this.fileToGenerate.Settings.fileOrder)
// 					.onChange((chosen: NotesOrder) => {
// 						this.fileToGenerate.Settings.fileOrder = chosen;
// 					})
// 			);
// 	}

// 	private generate(): void {
// 		new Setting(this.contentEl).addButton((btn) =>
// 			btn
// 				.setButtonText("Submit")
// 				.setCta()
// 				.onClick(() => {
// 					if (!this.fileToGenerate.Name) {
// 						this.fileToGenerate.Name = this.option;
// 					}

// 					this.close();

// 					this.onSubmit(this.fileToGenerate);
// 				})
// 		);
// 	}

// 	onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }
