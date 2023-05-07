import { App, DataAdapter, Notice } from "obsidian";
import { fileExists, fileOrder, fileNamer, getNotes } from "./utils";

export async function createIndex(
	app: App,
	includeFiles: boolean,
	folder?: string,
	order?: fileOrder
): Promise<string> {
	const noteNames = await getNotes(app, includeFiles, folder, order);
	const indexEntries = noteNames.map((name) => `- [[${name}]]`);
	const indexText = indexEntries.join("\n");
	const finalText = `## Index\n${indexText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossary(
	app: App,
	includeFiles: boolean,
	folder?: string,
	order?: fileOrder
): Promise<string> {
	const noteNames = await getNotes(app, includeFiles, folder, order);
	const glossaryEntries = noteNames.map(
		(name) => `#### ![[${name}]]\n\n***\n\n`
	);
	const glossaryText = glossaryEntries.join("");
	const finalText = `## Glossary\n${glossaryText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossaryIndex(
	app: App,
	includeFiles: boolean,
	fileName: string,
	folder?: string,
	order?: fileOrder
): Promise<string> {
	const noteNames = await getNotes(app, includeFiles, folder, order);
	const indexEntries = noteNames.map(
		(name) => `- [[${fileName}#${name}|${name}]]`
	);
	const indexText = indexEntries.join("\n");
	const glossaryEntries = noteNames.map(
		(name) => `#### ![[${name}]]\n\n***\n\n`
	);
	const glossaryText = glossaryEntries.join("");
	const finalText = `## Index\n${indexText}\n\n***\n\n## Glossary\n${glossaryText}`;
	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createIndexFile(
	app: App,
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	folder?: string,
	order?: fileOrder,
	destFolder?: string
) {
	if (folder === app.vault.getName()) {
		folder = "";
	}

	const completeFileName = fileNamer("index", fileName, folder, destFolder);
	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool && !overwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createIndex(app, includeFiles, folder, order)
		);
		new Notice(`${completeFileName} file updated`);
	}
}

export async function createGlossaryFile(
	app: App,
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	folder?: string,
	order?: fileOrder,
	destFolder?: string
) {
	if (folder === app.vault.getName()) {
		folder = "";
	}

	const completeFileName = fileNamer(
		"glossary",
		fileName,
		folder,
		destFolder
	);
	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool && !overwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossary(app, includeFiles, folder, order)
		);
		new Notice(`${completeFileName} file updated`);
	}
}

export async function createGlossaryIndexFile(
	app: App,
	includeFiles: boolean,
	overwrite: boolean,
	fileName: string,
	folder?: string,
	order?: fileOrder,
	destFolder?: string
) {
	if (folder === app.vault.getName()) {
		folder = "";
	}

	const completeFileName = fileNamer(
		"glossaryindex",
		fileName,
		folder,
		destFolder
	);
	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	if (fileExistsBool && !overwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossaryIndex(
				app,
				includeFiles,
				fileName,
				folder,
				order
			)
		);
		new Notice(`${completeFileName} file updated`);
	}
}
