import { App, DataAdapter, Notice } from "obsidian";
import {
	cleanFiles,
	fileExists,
	sortFiles,
	fileOrder,
	fileNamer,
} from "./utils";

export async function createIndex(
	app: App,
	fileInclusion: boolean,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<string> {
	let notesTFile = app.vault.getMarkdownFiles();
	const notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app, notesTFile);
	}

	if (fileOrder) {
		notesTFile = sortFiles(notesTFile, fileOrder);
	}

	notesTFile.forEach((file) => {
		if (
			(chosenFolder && file.path.includes(chosenFolder)) ||
			!chosenFolder
		) {
			notes.push(file.name);
		}
	});

	const indexArray: string[] = [];
	let noteName: string;

	notes.forEach((note) => {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		noteName = note.slice(0, -3);

		indexArray.push(`- [[${noteName}]]\n`);
	});

	// Arrays toString + remove only the commas that separate the entries
	const finalText = `## Index\n${indexArray
		.toString()
		.replace(/,-\s\[\[/g, "- [[")}`;

	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossary(
	app: App,
	fileInclusion: boolean,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<string> {
	let notesTFile = app.vault.getMarkdownFiles();
	const notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app, notesTFile);
	}

	if (fileOrder) {
		notesTFile = sortFiles(notesTFile, fileOrder);
	}

	notesTFile.forEach((file) => {
		if (
			(chosenFolder && file.path.includes(chosenFolder)) ||
			!chosenFolder
		) {
			notes.push(file.name);
		}
	});

	const glossaryArray: string[] = [];
	let noteName: string;

	notes.forEach((note) => {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		noteName = note.slice(0, -3);

		// Array of strings that will show up as embedded notes
		// #### to make them findable as sections
		glossaryArray.push(`#### ![[${noteName}]]\n\n***\n\n`);
	});

	// Arrays toString + remove only the commas that separate the entries
	const finalText = `## Glossary\n${glossaryArray
		.toString()
		.replace(/,####\s!\[\[/g, "#### ![[")}`;

	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createGlossaryIndex(
	app: App,
	fileInclusion: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<string> {
	let notesTFile = app.vault.getMarkdownFiles();
	const notes: string[] = [];

	if (!fileInclusion) {
		notesTFile = await cleanFiles(app, notesTFile);
	}

	if (fileOrder) {
		notesTFile = sortFiles(notesTFile, fileOrder);
	}

	notesTFile.forEach((file) => {
		if (
			(chosenFolder && file.path.includes(chosenFolder)) ||
			!chosenFolder
		) {
			notes.push(file.name);
		}
	});

	const glossaryArray: string[] = [];
	const indexArray: string[] = [];
	let noteName: string;

	notes.forEach((note) => {
		// To obtain the note name in a 'linkable' format we have to remove the extension (aka the last 3 character)
		noteName = note.slice(0, -3);

		// Array of strings that will show up as an index. If clicked, each entry takes to the point in the same document where the note is embedded

		indexArray.push(`- [[${fileName}#${noteName}|${noteName}]]\n`);

		// Array of strings that will show up as embedded notes
		// #### to make them findable as sections
		glossaryArray.push(`#### ![[${noteName}]]\n\n***\n\n`);
	});

	const indexText = `## Index\n${indexArray
		.toString()
		.replace(/,-\s\[\[/g, "- [[")}`;

	const glossaryText = `## Glossary\n${glossaryArray
		.toString()
		.replace(/,####\s!\[\[/g, "#### ![[")}`;

	// Arrays toString + remove only the commas that separate the entries
	const finalText = `${indexText}\n***\n\n${glossaryText}`;

	return `---\ntags: obsidian-auto-glossary\n---\n${finalText}`;
}

export async function createIndexFile(
	app: App,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: fileOrder,
	destFolder?: string
) {
	if (chosenFolder == app.vault.getName()) {
		chosenFolder = "";
	}

	const completeFileName: string = fileNamer("index", fileName, chosenFolder);

	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	console.log("destFolder: " + destFolder);
	console.log("completeFileName: " + completeFileName);

	if (fileExistsBool && !fileOverwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createIndex(app, fileInclusion, chosenFolder, fileOrder)
		);
		new Notice(`${completeFileName} file updated`);
	}
}

export async function createGlossaryFile(
	app: App,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: fileOrder,
	destFolder?: string
) {
	if (chosenFolder == app.vault.getName()) {
		chosenFolder = "";
	}

	const completeFileName: string = fileNamer(
		"glossary",
		fileName,
		chosenFolder
	);

	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	console.log("destFolder: " + destFolder);
	console.log("completeFileName: " + completeFileName);

	if (fileExistsBool && !fileOverwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossary(app, fileInclusion, chosenFolder, fileOrder)
		);
		new Notice(`${completeFileName} file updated`);
	}
}

export async function createGlossaryIndexFile(
	app: App,
	fileInclusion: boolean,
	fileOverwrite: boolean,
	fileName: string,
	chosenFolder?: string,
	fileOrder?: fileOrder,
	destFolder?: string
) {
	if (chosenFolder == app.vault.getName()) {
		chosenFolder = "";
	}

	const completeFileName: string = fileNamer(
		"glossaryindex",
		fileName,
		chosenFolder
	);

	const fileExistsBool = await fileExists(app, completeFileName);
	const adapter: DataAdapter = app.vault.adapter;

	console.log("destFolder: " + destFolder);
	console.log("completeFileName: " + completeFileName);

	if (fileExistsBool && !fileOverwrite) {
		new Notice(
			`${completeFileName} file already exists. Try again with overwrite enabled or a different file name.`
		);
	} else {
		adapter.write(
			completeFileName + ".md",
			await createGlossaryIndex(
				app,
				fileInclusion,
				fileName,
				chosenFolder,
				fileOrder
			)
		);
		new Notice(`${completeFileName} file updated`);
	}
}

/*async function createText(
	app: App,
	requestedFile: fileType,
	fileInclusion: boolean,
	fileName?: string,
	chosenFolder?: string,
	fileOrder?: fileOrder
): Promise<string> {
	const array = await createArrays(
		app,
		requestedFile,
		fileInclusion,
		fileName,
		chosenFolder,
		fileOrder
	);
	let text = "---\ntags: obsidian-auto-glossary\n---\n";

	switch (requestedFile) {
		case "glossary":
			text += array[1];
			break;
		case "index":
			text += array[0];
			break;
		case "glossaryindex":
			text += array[0] + "\n***\n\n" + array[1];
			break;
		default:
			break;
	}

	return text;
}*/
