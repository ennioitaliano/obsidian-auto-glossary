import { Plugin, TFolder } from "obsidian";
import { CreateFileModal } from "./modal";
import { createFile } from "./glossaryIndex";
import { FileOrder, FileType, getEnumFO, getEnumFT } from "./utils";
import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "./settings";

export default class AutoGlossaryPlugin extends Plugin {
	settings: AutoGlossarySettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Register single file-menu handler for folder context menus
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (!(folder instanceof TFolder)) {
					return;
				}

				const folderName = folder.name || "Vault";
				const folderPath = folder.path === "/" ? "" : folder.path;

				// Quick generation options
				menu.addItem((item) => {
					item.setTitle("Auto Glossary: New index")
						.setIcon("list")
						.setSection("auto-glossary")
						.onClick(async () => {
							await createFile(
								this.app,
								FileType.Index,
								this.settings.fileInclusion,
								this.settings.fileOverwrite,
								`${folderName}_Index`,
								folderPath,
								getEnumFO(this.settings.fileOrder),
								this.settings.sameDest ? "" : this.settings.fileDest
							);
						});
				});

				menu.addItem((item) => {
					item.setTitle("Auto Glossary: New glossary")
						.setIcon("layout-list")
						.setSection("auto-glossary")
						.onClick(async () => {
							await createFile(
								this.app,
								FileType.Glossary,
								this.settings.fileInclusion,
								this.settings.fileOverwrite,
								`${folderName}_Glossary`,
								folderPath,
								getEnumFO(this.settings.fileOrder),
								this.settings.sameDest ? "" : this.settings.fileDest
							);
						});
				});

				menu.addItem((item) => {
					item.setTitle("Auto Glossary: New index+glossary")
						.setIcon("list-ordered")
						.setSection("auto-glossary")
						.onClick(async () => {
							await createFile(
								this.app,
								FileType.GlossaryIndex,
								this.settings.fileInclusion,
								this.settings.fileOverwrite,
								`${folderName}_GlossaryIndex`,
								folderPath,
								getEnumFO(this.settings.fileOrder),
								this.settings.sameDest ? "" : this.settings.fileDest
							);
						});
				});

				// Advanced generation options
				menu.addItem((item) => {
					item.setTitle("Auto Glossary: Advanced index")
						.setIcon("list")
						.setSection("auto-glossary-advanced")
						.onClick(() => {
							new CreateFileModal(
								this.app,
								this.settings.fileOverwrite,
								this.settings.sameDest,
								this.settings.fileDest,
								this.settings.fileOrder,
								(
									option,
									overwrite,
									fileName,
									chosenFolder,
									fileOrder,
									destFolder
								) => {
									void createFile(
										this.app,
										getEnumFT(option),
										this.settings.fileInclusion,
										overwrite,
										fileName,
										chosenFolder,
										getEnumFO(fileOrder),
										destFolder
									);
								},
								folderPath,
								`${folderName}_Index`,
								FileType.Index
							).open();
						});
				});

				menu.addItem((item) => {
					item.setTitle("Auto Glossary: Advanced glossary")
						.setIcon("layout-list")
						.setSection("auto-glossary-advanced")
						.onClick(() => {
							new CreateFileModal(
								this.app,
								this.settings.fileOverwrite,
								this.settings.sameDest,
								this.settings.fileDest,
								this.settings.fileOrder,
								(
									option,
									overwrite,
									fileName,
									chosenFolder,
									fileOrder,
									destFolder
								) => {
									void createFile(
										this.app,
										getEnumFT(option),
										this.settings.fileInclusion,
										overwrite,
										fileName,
										chosenFolder,
										getEnumFO(fileOrder),
										destFolder
									);
								},
								folderPath,
								`${folderName}_Glossary`,
								FileType.Glossary
							).open();
						});
				});

				menu.addItem((item) => {
					item.setTitle("Auto Glossary: Advanced index+glossary")
						.setIcon("list-ordered")
						.setSection("auto-glossary-advanced")
						.onClick(() => {
							new CreateFileModal(
								this.app,
								this.settings.fileOverwrite,
								this.settings.sameDest,
								this.settings.fileDest,
								this.settings.fileOrder,
								(
									option,
									overwrite,
									fileName,
									chosenFolder,
									fileOrder,
									destFolder
								) => {
									void createFile(
										this.app,
										getEnumFT(option),
										this.settings.fileInclusion,
										overwrite,
										fileName,
										chosenFolder,
										getEnumFO(fileOrder),
										destFolder
									);
								},
								folderPath,
								`${folderName}_GlossaryIndex`,
								FileType.GlossaryIndex
							).open();
						});
				});
			})
		);

		// Add Command Palette Command
		this.addCommand({
			id: "create-glossary-index",
			name: "Create glossary or index",
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				const defaultFolder = activeFile?.parent?.path ?? "";
				const defaultFolderName = activeFile?.parent?.name || "Vault";

				new CreateFileModal(
					this.app,
					this.settings.fileOverwrite,
					this.settings.sameDest,
					this.settings.fileDest,
					this.settings.fileOrder,
					(
						option,
						overwrite,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder
					) => {
						void createFile(
							this.app,
							getEnumFT(option),
							this.settings.fileInclusion,
							overwrite,
							fileName,
							chosenFolder,
							getEnumFO(fileOrder),
							destFolder
						);
					},
					defaultFolder,
					`${defaultFolderName}_Index`,
					FileType.GlossaryIndex
				).open();
			},
		});

		// Settings tab
		this.addSettingTab(new SettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}


