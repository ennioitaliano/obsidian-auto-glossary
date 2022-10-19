export enum cases {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

export function getEnum(value: string): cases {
	let result: cases = cases.gi;

	switch (value.toLowerCase()) {
		case "glossary":
			result = cases.g;
			break;
		case "index":
			result = cases.i;
			break;
		case "glossaryindex":
			result = cases.gi;
			break;
		default:
			break;
	}

	return result;
}

export function fileExists(fileName: string): boolean {
	const notesTFile = global.app.vault.getMarkdownFiles();
	let notes: string[] = [];
	let result: boolean;

	for (let i = 0; i < notesTFile.length; i++) {
		//console.log(i + notesTFile[i].path);
		notes[i] = notesTFile[i].path;
	}

	if (notes.contains(fileName + ".md")) {
		result = true;
	} else {
		result = false;
	}

	return result;
}
