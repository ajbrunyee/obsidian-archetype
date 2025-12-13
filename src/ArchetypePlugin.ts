import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { ArchetypeSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { ArchetypeSettingsTab } from './settings/SettingsTab';
import { ChunkingService } from './domain/chunking/ChunkingService';
import { ChunkingStrategy } from './domain/chunking/ChunkingStrategy';
import { ChunkProgression } from './domain/progression/ChunkProgression';
import { ChunkTiming } from './domain/timing/ChunkTiming';
import { ReadingSpeed } from './domain/timing/ReadingSpeed';
import { SegmentPlayer } from './views/SegmentPlayer';

export class ArchetypePlugin extends Plugin {
	settings: ArchetypeSettings;

	async onload() {
		await this.loadSettings();

		// Add speed reading command
		this.addCommand({
			id: 'start-speed-reading',
			name: 'Start speed reading',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				const selection = editor.getSelection();
				
				if (!selection || selection.trim().length === 0) {
					new Notice('Please select some text to read');
					return;
				}

				try {
					// Create segments from selected text (word-based, 3 words per segment)
					const strategy = ChunkingStrategy.wordBased(3);
					const sequence = ChunkingService.chunk(selection, strategy);

					// Setup timing (300 WPM - normal speed)
					const timing = new ChunkTiming(ReadingSpeed.NORMAL);

					// Create progression
					const progression = new ChunkProgression(sequence);

					// Create and show player
					const player = new SegmentPlayer(this.app, progression, timing);
					player.show();

				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error('Speed reading error:', error);
				}
			}
		});

		// Add settings tab
		this.addSettingTab(new ArchetypeSettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

