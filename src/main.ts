import { Plugin, TFolder } from "obsidian";

import { CreateFileModal } from "./modal";
import { createFile, setupDirectoryWatcher } from "./glossaryIndex";
import { getEnumFT, getEnumFO, fileType, getIndexFiles } from "./utils";
import { AutoGlossarySettings, DEFAULT_SETTINGS, SettingTab } from "settings";
import { FileSystemAdapter } from "obsidian";

export default class autoGlossary extends Plugin {
	// SETTINGS
	settings: AutoGlossarySettings;
	async onload() {
		console.info("Auto Glossary enabled");

		//SETTINGS
		await this.loadSettings();
		/* // This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Auto Glossary",
			(evt: MouseEvent) => {
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");*/

		const adapter = this.app.vault.adapter as FileSystemAdapter;
		const indexFilePaths = await getIndexFiles(adapter);

		for (let path of indexFilePaths) {
			const pathTokens = path.split("/");
			// TODO: This is sooo ugly, needs to be fixed up
			const filename: string | undefined = pathTokens.pop()?.split(".").shift();
			if (filename === undefined) {
				// Invalid filename
				return;
			}

			// Remove the filename so just the directory exists
			const obsidianRelativePath = pathTokens.join("/");

			const fullPath = adapter.getBasePath() + "/" + obsidianRelativePath;

			// TODO: investigate the settings property
			setupDirectoryWatcher(fullPath, obsidianRelativePath, filename, this.settings);
		}

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					const indexFilename: string = folder.name + "_Index";
					const destFolder: string = this.settings.sameDest ? "" : this.settings.fileDest;
					menu.addItem((item) => {
						item.setTitle("New index")
							.setIcon("list")
							.onClick(async () => {
								createFile(
									this.app,
									fileType.i,
									this.settings.fileInclusion,
									this.settings.fileOverwrite,
									indexFilename,
									folder.path,
									getEnumFO(this.settings.fileOrder),
									destFolder
								);

								// TODO: investigate settings properties
								setupDirectoryWatcher(adapter.getBasePath() + "/" + folder.path, folder.path, indexFilename, this.settings);
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("New glossary")
							.setIcon("layout-list")
							.onClick(async () => {
								createFile(
									this.app,
									fileType.g,
									this.settings.fileInclusion,
									this.settings.fileOverwrite,
									folder.name + "_Glossary",
									folder.path,
									getEnumFO(this.settings.fileOrder),
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								);
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("New index+glossary")
							.setIcon("list-ordered")
							.onClick(async () => {
								createFile(
									this.app,
									fileType.gi,
									this.settings.fileInclusion,
									this.settings.fileOverwrite,
									folder.name + "_GlossaryIndex",
									folder.path,
									getEnumFO(this.settings.fileOrder),
									this.settings.sameDest
										? ""
										: this.settings.fileDest
								);
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Advanced index")
							.setIcon("list")
							.onClick(async () => {
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
										createFile(
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
									folder.path,
									folder.name + "_Index",
									fileType.i
								).open();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Advanced glossary")
							.setIcon("layout-list")
							.onClick(async () => {
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
										createFile(
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
									folder.path,
									folder.name + "_Glossary",
									fileType.g
								).open();
							});
					});
				}
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (folder instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Advanced index+glossary")
							.setIcon("list-ordered")
							.onClick(async () => {
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
										createFile(
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
									folder.path,
									folder.name + "_GlossaryIndex",
									fileType.gi
								).open();
							});
					});
				}
			})
		);

		/*this.addCommand({
			id: "create-glossary",
			name: "Create glossary",
			callback: () => {
				new CreateFileModal(
					this.app,
					this.settings.fileOverwrite,
					(
						option,
						fileName,
						chosenFolder,
						fileOrder,
						destFolder,
						overwrite
					) => {
						createFile(
							this.app,
							getEnumFT(option),
							this.settings.fileInclusion,
							fileName,
							overwrite,
							chosenFolder,
							getEnumFO(fileOrder),
							destFolder
						);
					}
				).open();
			},
		});*/

		// SETTINGS
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {
		console.info("Auto Glossary unloaded");
	}

	// SETTINGS
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		console.log("Settings saved.");
	}
}
