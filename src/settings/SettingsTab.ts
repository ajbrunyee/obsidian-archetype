import { App, PluginSettingTab, Setting } from 'obsidian';
import { ArchetypePlugin } from '../ArchetypePlugin';

export class ArchetypeSettingsTab extends PluginSettingTab {
	plugin: ArchetypePlugin;

	constructor(app: App, plugin: ArchetypePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// Speed Reading Section
		containerEl.createEl('h2', {text: 'Speed Reading'});

		new Setting(containerEl)
			.setName('Words per minute')
			.setDesc('Target reading speed (100-1000 WPM)')
			.addSlider(slider => slider
				.setLimits(100, 1000, 50)
				.setValue(this.plugin.settings.speedReadingWPM)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.speedReadingWPM = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Chunk size')
			.setDesc('Number of words per segment (1-10)')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.speedReadingChunkSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.speedReadingChunkSize = value;
					await this.plugin.saveSettings();
				}));

		// Touch Typing Section
		containerEl.createEl('h2', {text: 'Touch Typing'});

		new Setting(containerEl)
			.setName('Words per chunk')
			.setDesc('Number of words to type at once (1-10)')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.typingChunkSize)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.typingChunkSize = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Match strategy')
			.setDesc('How strictly to compare your input')
			.addDropdown(dropdown => dropdown
				.addOption('lenient', 'Lenient (case-insensitive, trim whitespace)')
				.addOption('strict', 'Strict (exact match required)')
				.addOption('fuzzy', 'Fuzzy (allow typos)')
				.setValue(this.plugin.settings.typingMatchStrategy)
				.onChange(async (value: 'lenient' | 'strict' | 'fuzzy') => {
					this.plugin.settings.typingMatchStrategy = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Fuzzy match threshold')
			.setDesc('Maximum typos allowed in fuzzy mode (1-5)')
			.addSlider(slider => slider
				.setLimits(1, 5, 1)
				.setValue(this.plugin.settings.typingFuzzyThreshold)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.typingFuzzyThreshold = value;
					await this.plugin.saveSettings();
				}));
	}
}
