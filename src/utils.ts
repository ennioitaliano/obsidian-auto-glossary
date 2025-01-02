
import { DataAdapterWrapper } from "interfaces/DataAdapterWrapper";
import { VaultWrapper } from "interfaces/VaultWrapper";
import { TFile, FileSystemAdapter } from "obsidian";

/**
 * Enum to handle different cases
 */
export enum fileType {
	i = "index",
	g = "glossary",
	gi = "glossaryIndex",
}

/**
 * Enum to handle different orders
 */
export enum fileOrder {
	default = "default",
	mtime_new = "mtime_new",
	mtime_old = "mtime_old",
	ctime_new = "ctime_new",
	ctime_old = "ctime_old",
	alphabetical = "alphabetical",
	alphabetical_rev = "alphabetical_rev",
}

/**
 * Gets index files (based on default names)
 * @param adapter - The obsidian adapter
 * @param path - The path to get files from (defaults to '/')
 * @returns A list of detected index file paths
 * TODO: this should use plugin tags instead, there should be an example where this is done in the codebase
 */
export async function getIndexFiles(adapter: FileSystemAdapter, path: string = "/"): Promise<Array<string>> {
	const foundIndexPaths = [];
	// TODO: This should find a base index file or glossary
	const directoryList = await adapter.list(path);	

	// Look for indexes in all user created folders, recursively
	const userFolderNames = getUserCreatedFolders(directoryList.folders);
	if (userFolderNames.length > 0) {
		for (let i = 0; i < userFolderNames.length; i++) {
			foundIndexPaths.push(...await getIndexFiles(adapter, userFolderNames[i]));
		}
	}

	const userFilenames = getUserCreatedFiles(directoryList.files);

	for (const filename of userFilenames) {
		// TODO: this doesn't really need the path (since filename includes), this should be improved
		if (isIndexFile(filename, path)) {
			foundIndexPaths.push(filename);
		}
	}

	return foundIndexPaths;	
}

/**
 * Extracts the deepest folder name in a path
 * @param path - The path to extract the name from
 * @returns The folder name
 */
function extractFolderName(path: string): string {
	const pathSegments: Array<string> = path.split("/");
	if (pathSegments.length === 0) {
		throw Error("Expected path length of at least one, but got: " + path);
	}
	return pathSegments[pathSegments.length - 1];
}

/**
 * Determines if the file is an created index file (based on the default index name {FolderName}_Index)
 * @param filepath - The filepath to check
 * @param folderPath - The full path to the folder 
 * @returns True if the filepath passes, 
 * This pattern has to exist somewhere else, since this file gets created, we should investigate that and see if the coupling is worth it
 */
function isIndexFile(filepath: string, folderPath: string): boolean {
	const expectedIndexName = extractFolderName(folderPath) + "_Index";
	return filepath.contains(expectedIndexName);
}

/**
 * Gets all user created files (non-obsidian created files)
 * @param fileList - A list of file paths to filter through
 * @returns A list of files that were not created by obsidian
 * TODO: Also, all of this logic for finding the index files should probably be extracted out to it's own file and class
 */
function getUserCreatedFiles(fileList: Array<string>): Array<string> {
	// TODO: Remove hardcoded value to constant
	return fileList.filter((filename: string) => { return filename !== ".DS_Store"; })	;
}

/**
 * Gets all user created folders (non-obsidian created folders)
 * @param folderList - A list of folder paths to filter through
 * @returns A list of directories with obsidian created folders removed
 * TODO: All of this logic for finding the index files should probably be extracted out to it's own file and class
 */
function getUserCreatedFolders(folderList: Array<string>): Array<string> {
	// TODO: Remove hardcoded value to constant
	return folderList.filter((folderName: string) => { return folderName !== ".obsidian"; });
}

/**
 * Function to get the file type enum key from the string
 * @param value - The value to get
 * @return an enum that corresponds to that value
 */
export function getEnumFT(value: string): fileType {
	let result: fileType;

	switch (value.toLowerCase()) {
		case "glossary":
			result = fileType.g;
			break;
		case "index":
			result = fileType.i;
			break;
		case "glossaryindex":
			result = fileType.gi;
			break;
		default:
			result = fileType.gi;
			break;
	}

	return result;
}

/**
 * Function to get the file order enum key from a string
 * @param value - The raw string value
 * TODO: This function should throw if no value is found rather than returning an undefined value
 * @returns If the string matches, the corresponding fileOrder enum is returned, otherwise an empty value is returned
 */
export function getEnumFO(value: string): fileOrder {
	let result: fileOrder;
	if (!value) {
		return fileOrder.default;
	} else {
		switch (value.toLowerCase()) {
			case "default":
				result = fileOrder.default;
				break;
			case "mtime_new":
				result = fileOrder.mtime_new;
				break;
			case "mtime_old":
				result = fileOrder.mtime_old;
				break;
			case "ctime_new":
				result = fileOrder.ctime_new;
				break;
			case "ctime_old":
				result = fileOrder.ctime_old;
				break;
			case "alphabetical":
				result = fileOrder.alphabetical;
				break;
			case "alphabetical_rev":
				result = fileOrder.alphabetical_rev;
				break;
			default:
				result = fileOrder.default;
				break;
		}
	}

	return result;
}

/**
 * Checks to see if a file exists
 * @param adapter - The obsidian data adapter object
 * @param filename - The filename to check
 * @returns true if the file exists, false otherwise
 */
export async function fileExists(adapter: DataAdapterWrapper, filename: string): Promise<boolean> {
	const result = await adapter.exists(filename + ".md");

	if (result) {
		console.log("Already existing file " + filename + ".md");
	}

	return result;
}

/**
 * Removes auto glossary tagged files
 * @param vault - The obsidian vault
 * @param notesTFiles - The notes to filter through
 * @returns an array of all notes that do not contain the plugin tag
 */
export async function cleanFiles(
	vault: VaultWrapper,
	notesTFiles: TFile[]
): Promise<TFile[]> {
	const cleanedNotes: TFile[] = [];

	// TODO: Pretty sure this can just be done with a JS filter
	notesTFiles.forEach(async (file: TFile) => {
		const fileContent: string = await vault.cachedRead(file);
		// TODO: This tag should be a constant somewhere
		if (!fileContent.includes("---\ntags: obsidian-auto-glossary\n---\n")) {
			cleanedNotes.push(file);
		}
	});

	return cleanedNotes;
}

/**
 * Sorts a list of files
 * @param notesTFile - The list of files to sort
 * @param fileOrder - The order criteria
 * TODO: get this function covered at some point
 */
/* c8 ignore next */
export function sortFiles(notesTFile: TFile[], fileOrder: fileOrder) {
	switch (fileOrder) {
		case "ctime_new":
			notesTFile.sort((a, b) => b.stat.ctime - a.stat.ctime);
			break;
		case "ctime_old":
			notesTFile.sort((a, b) => a.stat.ctime - b.stat.ctime);
			break;
		case "mtime_new":
			notesTFile.sort((a, b) => b.stat.mtime - a.stat.mtime);
			break;
		case "mtime_old":
			notesTFile.sort((a, b) => a.stat.mtime - b.stat.mtime);
			break;
		case "alphabetical":
			notesTFile.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // ignore upper and lowercase
				const nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA < nameB) {
					return -1;
				}
				if (nameA > nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			});
			break;
		case "alphabetical_rev":
			notesTFile.sort((a, b) => {
				const nameA = a.name.toUpperCase(); // ignore upper and lowercase
				const nameB = b.name.toUpperCase(); // ignore upper and lowercase
				if (nameA > nameB) {
					return -1;
				}
				if (nameA < nameB) {
					return 1;
				}

				// names must be equal
				return 0;
			});
			break;
		case "default":
		default:
			break;
	}

	return notesTFile;
}
