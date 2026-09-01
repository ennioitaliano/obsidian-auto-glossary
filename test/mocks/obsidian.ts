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
	getControlValue(key: string): unknown {
		return undefined;
	}
	setControlValue(key: string, value: unknown): void | Promise<void> {}
	refreshDomState(): void {}
	display(): void {}
}

export class Setting {
	constructor(containerEl: HTMLElement) {}
	setName(name: string): this {
		return this;
	}
	setDesc(desc: string): this {
		return this;
	}
	setHeading(): this {
		return this;
	}
	setClass(cls: string): this {
		return this;
	}
	setDisabled(disabled: boolean): this {
		return this;
	}
	addToggle(cb: (toggle: unknown) => unknown): this {
		const toggle: Record<string, unknown> = {};
		toggle.setValue = () => toggle;
		toggle.onChange = () => toggle;
		toggle.setDisabled = () => toggle;
		cb(toggle);
		return this;
	}
	addText(cb: (text: unknown) => unknown): this {
		const comp: Record<string, unknown> = {};
		comp.setPlaceholder = () => comp;
		comp.setValue = () => comp;
		comp.onChange = () => comp;
		comp.setDisabled = () => comp;
		cb(comp);
		return this;
	}
	addDropdown(cb: (dropdown: unknown) => unknown): this {
		const drop: Record<string, unknown> = {};
		drop.addOption = () => drop;
		drop.setValue = () => drop;
		drop.onChange = () => drop;
		drop.setDisabled = () => drop;
		cb(drop);
		return this;
	}
	addButton(cb: (button: unknown) => unknown): this {
		const btn: Record<string, unknown> = {};
		btn.setButtonText = () => btn;
		btn.setCta = () => btn;
		btn.onClick = () => btn;
		btn.setDisabled = () => btn;
		cb(btn);
		return this;
	}
}
