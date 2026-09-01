# Obsidian Auto Glossary

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22auto-glossary%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=auto-glossary)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ennioitaliano/obsidian-auto-glossary?color=%23483699)](https://github.com/ennioitaliano/obsidian-auto-glossary/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Auto Glossary** is an Obsidian plugin that automatically generates and updates a [MOC (Map of Content) / Index](https://notes.linkingyourthinking.com/Cards/MOCs+Overview), a [Glossary](https://en.wikipedia.org/wiki/Glossary) with embedded note previews, or a combined Glossary & Index from any folder in your vault.

---

## ✨ Features

- **Index (MOC)**: Creates a list of wikilinks to all notes in the selected folder.
- **Glossary**: Creates a document embedding (`![[Note]]`) all notes in the selected folder, formatted with headers and dividers.
- **Index + Glossary**: Creates an index with anchor links at the top pointing directly to each note's section in the glossary below.
- **Flexible Sorting**: Sort notes by:
  - Default (Vault order)
  - Modification time (Newest to oldest / Oldest to newest)
  - Creation time (Newest to oldest / Oldest to newest)
  - Alphabetical (A-Z / Z-A)
- **Smart Exclusion**: Avoid infinite loops by automatically ignoring previously generated auto-glossary files (customizable in settings).
- **Desktop & Mobile Support**: Fully compatible with Obsidian on desktop (macOS, Windows, Linux) and mobile (iOS, Android).
- **Command Palette & Context Menu**: Trigger quick generation directly via right-click on any folder in the File Explorer or use the Advanced modal.

---

## 🚀 How to Use

### 1. Context Menu (Quick & Advanced)
- Right-click on any folder in the Obsidian File Explorer.
- Choose from:
  - **New index**: Creates `<FolderName>_Index.md` in the folder.
  - **New glossary**: Creates `<FolderName>_Glossary.md` in the folder.
  - **New index+glossary**: Creates `<FolderName>_GlossaryIndex.md` in the folder.
  - **Advanced options**: Opens a dialog to customize the destination folder, target filename, sorting order, file type, and overwrite preferences.

### 2. Command Palette
- Press `Ctrl/Cmd + P` and search for **Auto Glossary: Create glossary or index**.
- Choose your desired settings and generate the file.

---

## ⚙️ Settings

- **File Inclusion**: Toggle whether to include previously generated Auto Glossary files in newly created indexes.
- **Same destination as folder**: Set whether files are created in the target folder or a global custom destination.
- **Default Destination Folder**: If custom destination is enabled, choose the folder where generated files are saved.
- **Overwrite existing files**: Set default behavior when a file with the same name already exists.
- **Default File Order**: Choose your preferred default sorting mode.

---

## 📦 Installation

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

## 📄 License

This plugin is licensed under the [MIT License](LICENSE).

