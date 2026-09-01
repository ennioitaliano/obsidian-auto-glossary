## Releases

- **Recommendation**: Missing GitHub artifact attestations for release assets
  - main.js
  - Artifact attestations let users cryptographically verify the provenance of the release assets, proving they were built from the source repository. https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds
- **Recommendation**: Release contains extra unsupported files
  - auto-glossary.zip
  - All other files will not be downloaded by Obsidian.

## Behavior

- **Recommendation**: **Vault Enumeration**: Enumerates all files in the vault (`vault.getFiles`, `getMarkdownFiles`, etc.). Gives the plugin access to every file path in the vault.

## Source code

- **Warning**: "builtin-modules" should be replaced with an alternative package.
  - https://github.com/es-tooling/module-replacements/blob/main/docs/modules/builtin-modules.md
  - package.json:35
- **Warning**: "lodash" should be replaced with an alternative package.
  - https://github.com/es-tooling/module-replacements/blob/main/docs/modules/lodash-underscore.md
  - package.json:38
- **Warning**: The two values in this comparison do not have a shared enum type.
  - src/glossaryIndex.ts:142
- **Warning**: Uses Obsidian APIs newer than the declared `minAppVersion`
  - obsidianmd/no-unsupported-api
  - src/modal.ts:101, src/modal.ts:108-119, src/modal.ts:235, src/modal.ts:239-250, src/settings.ts:128, src/settings.ts:133-147, src/settings.ts:166, src/settings.ts:171-185
- **Warning**: This PluginSettingTab does not implement getSettingDefinitions(); its settings will not appear in Obsidian's settings search for users on 1.13.0 or later. Consider adopting the declarative settings API.
  - src/settings.ts:42
- **Warning**: For a consistent UI use `new Setting(containerEl).setName(...).setHeading()` instead of creating HTML heading elements directly.
  - src/settings.ts:55, src/settings.ts:57, src/settings.ts:149, src/settings.ts:226, src/settings.ts:273
- **Warning**: The case statement does not have a shared enum type with the switch predicate.
  - src/utils.ts:301-303, src/utils.ts:304-306, src/utils.ts:307-309, src/utils.ts:310-312, src/utils.ts:313-315, src/utils.ts:316-318, src/utils.ts:319, src/utils.ts:333-335, src/utils.ts:336, src/utils.ts:337
- **Recommendation**: 'FileOrder' is defined but never used.
  - src/main.ts:4
