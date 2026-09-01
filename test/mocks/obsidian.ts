export function normalizePath(path: string): string {
	return path
		.replace(/\\/g, "/")
		.replace(/\/+/g, "/")
		.replace(/^\.\//, "")
		.replace(/\/$/, "");
}

export class Notice {
	message: string;
	timeout?: number;
	constructor(message: string, timeout?: number) {
		this.message = message;
		this.timeout = timeout;
	}
}

export class TAbstractFile {
	vault: unknown;
	path = "";
	name = "";
	parent: TFolder | null = null;
}

export class TFile extends TAbstractFile {
	stat = { ctime: 0, mtime: 0, size: 0 };
	basename = "";
	extension = "";
}

export class TFolder extends TAbstractFile {
	children: TAbstractFile[] = [];
	isRoot(): boolean {
		return this.path === "" || this.path === "/";
	}
}

export class App {
	vault: unknown;
	workspace: unknown;
	metadataCache: unknown;
}

export class Plugin {
	app: App;
	manifest: unknown;
	constructor(app: App, manifest: unknown) {
		this.app = app;
		this.manifest = manifest;
	}
	registerEvent(event: unknown): void {}
	addCommand(command: unknown): void {}
	addSettingTab(tab: unknown): void {}
	async loadData(): Promise<unknown> {
		return {};
	}
	async saveData(data: unknown): Promise<void> {}
}

export class Modal {
	app: App;
	contentEl: HTMLElement;
	constructor(app: App) {
		this.app = app;
		this.contentEl = {
			createEl: () => ({} as HTMLElement),
			empty: () => {},
		} as unknown as HTMLElement;
	}
	open(): void {}
	close(): void {}
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;
	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = {
			createEl: () => ({} as HTMLElement),
			empty: () => {},
		} as unknown as HTMLElement;
	}
}

export class Setting {
	constructor(containerEl: HTMLElement) {}
	setName(name: string): this {
		return this;
	}
	setDesc(desc: string): this {
		return this;
	}
	setClass(cls: string): this {
		return this;
	}
	setDisabled(disabled: boolean): this {
		return this;
	}
	addToggle(cb: (toggle: unknown) => unknown): this {
		cb({
			setValue: () => ({ onChange: () => {} }),
		});
		return this;
	}
	addText(cb: (text: unknown) => unknown): this {
		cb({
			setPlaceholder: () => ({ setValue: () => ({ onChange: () => {} }) }),
			setValue: () => ({ onChange: () => {} }),
		});
		return this;
	}
	addDropdown(cb: (dropdown: unknown) => unknown): this {
		cb({
			addOption: () => ({
				addOption: () => {},
				setValue: () => ({ onChange: () => {} }),
			}),
			setValue: () => ({ onChange: () => {} }),
		});
		return this;
	}
	addButton(cb: (button: unknown) => unknown): this {
		cb({
			setButtonText: () => ({ setCta: () => ({ onClick: () => {} }) }),
		});
		return this;
	}
}
