# obsidian-auto-glossary
Obsidian plugin that allows user to create:
- a glossary of files (list of `![[link]]`)
- an index (or MOC) of files (list of `[[link]]`)
- a glossary with an index (two lists above concatenated)
## TO-DO
- [ ] General code refactoring
- [ ] Option to exclude more tags from new files
- [ ] Handle sub-directories
	- [ ] option to create a file divided with sub-directories or tag
***
- [x] choose the directory of files I want in the glossary
	- [x] same as destination folder?
- [x] option to choose order of notes in the created file
- [x] better differentiation and use of fileName vs completeFileName (remember the existence of file.name)
- [x] file creation by right click on folder
	- [x] control wether is a file or folder
- [x] option to choose file name + eventual default naming system
- [x] modal with options for index, glossary or both
- [x] what happens if a file with the same name already exists?
- [x] remove files created by the plugin from indexes and glossaries
	- [x] setting
