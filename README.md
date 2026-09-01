# Obsidian Auto Glossary

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22auto-glossary%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=auto-glossary)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ennioitaliano/obsidian-auto-glossary?color=%23483699)](https://github.com/ennioitaliano/obsidian-auto-glossary/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Auto Glossary** is an Obsidian plugin that automatically generates and updates a [MOC (Map of Content) / Index](https://notes.linkingyourthinking.com/Cards/MOCs+Overview), a [Glossary](https://en.wikipedia.org/wiki/Glossary) with embedded note previews, or a combined Overview from any folder in your vault.

---

## Features

- **Index (Links only / MOC)**: Creates a list of wikilinks (`[[Note]]`) to all notes in the selected folder.
- **Glossary (Note embeds)**: Creates a document embedding (`![[Note]]`) all notes in the selected folder, formatted with headers and dividers.
- **Combined Index & Glossary**: Creates an index with anchor links at the top pointing directly to each note's embedded section in the glossary below.
- **Flexible Sorting**: Sort notes by:
  - Default (Vault order)
  - Modification time (Newest to oldest / Oldest to newest)
  - Creation time (Newest to oldest / Oldest to newest)
  - Alphabetical (A-Z / Z-A)
- **Smart Exclusion**: Avoid infinite loops by automatically ignoring previously generated auto-glossary files (customizable in settings).
- **Custom Templates**: Define markdown templates for index, glossary, or combined notes with metadata/frontmatter (e.g. `aliases`, tags) and layout customization.
- **Metadata Preservation on Refresh**: Re-generating or overwriting an existing glossary/index preserves custom frontmatter properties without wiping them out.
- **Desktop & Mobile Support**: Fully compatible with Obsidian on desktop (macOS, Windows, Linux) and mobile (iOS, Android).
- **Command Palette & Context Menu**: Trigger quick generation directly via right-click on any folder in the File Explorer or use the Advanced modal.

---

## How to Use

### 1. Context Menu (Quick & Advanced)
- Right-click on any folder in the Obsidian File Explorer.
- Choose from:
  - **New index (links)**: Creates `<FolderName>_Index.md` in the folder.
  - **New glossary (embeds)**: Creates `<FolderName>_Glossary.md` in the folder.
  - **New combined index & glossary**: Creates `<FolderName>_GlossaryIndex.md` in the folder.
  - **Advanced options**: Opens a dialog to customize the destination folder, target filename, template file, sorting order, file type, and overwrite preferences.

### 2. Command Palette
- Press `Ctrl/Cmd + P` and search for **Auto Glossary: Create index or glossary**.
- Choose your desired settings and generate the file.

---

## Templates

You can create custom templates in your vault to format generated files and include custom metadata.

### Supported Placeholders
- `{{content}}`: Full generated content (Index, Glossary, or Combined).
- `{{index}}`: The generated Index list.
- `{{glossary}}`: The generated Glossary embeds.
- `{{folder}}` / `{{name}}`: Name of the source folder (e.g. `Projects`).
- `{{folderPath}}`: Vault path of the source folder (e.g. `Work/Projects`).
- `{{title}}`: Name of the generated note.
- `{{date}}`: Current date (`YYYY-MM-DD`).
- `{{time}}`: Current time (`HH:mm`).

### Example Template
```markdown
---
aliases:
  - "{{folder}} Overview"
  - "{{folder}} MOC"
tags:
  - moc
  - dashboard
---
# {{folder}} Navigation

Last updated on {{date}} at {{time}}.

{{content}}
```

---

## Settings

- **File Inclusion**: Toggle whether to include previously generated Auto Glossary files in newly created indexes and glossaries.
- **Same destination as folder**: Set whether files are created in the target folder or a global custom destination.
- **Default Destination Folder**: If custom destination is enabled, choose the folder where generated files are saved.
- **Overwrite existing files**: Set default behavior when a file with the same name already exists.
- **Default File Order**: Choose your preferred default sorting mode.
- **Filename Patterns**: Customize default filenames for generated notes using the `{{folder}}` placeholder (e.g. `+{{folder}}_Index`, `-{{folder}}_Glossary`, or `{{folder}} MOC`):
  - **Index filename pattern**: Pattern for index files (default: `{{folder}}_Index`).
  - **Glossary filename pattern**: Pattern for glossary files (default: `{{folder}}_Glossary`).
  - **Combined filename pattern**: Pattern for combined overview files (default: `{{folder}}_GlossaryIndex`).
- **Templates**: Configure default template files from your vault for Index, Glossary, and Combined files.

---

## Installation

### From Obsidian Community Plugins
1. Open **Settings** > **Community plugins**.
2. Turn off **Restricted mode**.
3. Click **Browse** and search for `Auto Glossary`.
4. Click **Install**, then **Enable**.

### Manual Installation
1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/ennioitaliano/obsidian-auto-glossary/releases/latest).
2. Copy the files into `<vault>/.obsidian/plugins/auto-glossary/`.
3. Reload Obsidian or reload plugins in Settings.

---

## License

This plugin is licensed under the [MIT License](LICENSE).

