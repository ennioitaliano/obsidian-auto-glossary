import {
	MyFolder,
	AutoGlossarySettings,
} from "./old/modules_OLD";

export class GeneratedFile {
	private name: string;
	private folder: MyFolder;
	private settings: AutoGlossarySettings;

	constructor(name: string, folder: MyFolder, settings: AutoGlossarySettings) {
		this.name = name;
		this.folder = folder;
		this.settings = settings;
	}
}
