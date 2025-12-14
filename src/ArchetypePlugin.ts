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
import { TypingPlayer } from './views/TypingPlayer';
import { TypingSession } from './domain/typing/TypingSession';
import { LenientMatchStrategy } from './domain/typing/LenientMatchStrategy';
import { StrictMatchStrategy } from './domain/typing/StrictMatchStrategy';
import { FuzzyMatchStrategy } from './domain/typing/FuzzyMatchStrategy';
import { PunctuationStrippingMatchStrategy } from './domain/typing/PunctuationStrippingMatchStrategy';
import { MatchStrategy } from './domain/typing/MatchStrategy';

export class ArchetypePlugin extends Plugin {
	settings: ArchetypeSettings;

	async onload() {
		await this.loadSettings();

		// Add speed reading command
		this.addCommand({
			id: 'start-speed-reading',
			name: 'Start speed reading',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				// Use selection if available, otherwise use entire document
				let text = editor.getSelection();
				
				if (!text || text.trim().length === 0) {
					text = editor.getValue();
				}
				
				if (!text || text.trim().length === 0) {
					new Notice('No text to read');
					return;
				}

				try {
					// Create segments from text (word-based, configured chunk size)
					const strategy = ChunkingStrategy.wordBased(this.settings.speedReadingChunkSize);
					const sequence = ChunkingService.chunk(text, strategy);

					// Setup timing (use configured WPM)
					const timing = new ChunkTiming(ReadingSpeed.fromWPM(this.settings.speedReadingWPM));

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

		// Add touch typing command
		this.addCommand({
			id: 'start-touch-typing',
			name: 'Start touch typing',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				// Use selection if available, otherwise use entire document
				let text = editor.getSelection();
				
				if (!text || text.trim().length === 0) {
					text = editor.getValue();
				}
				
				if (!text || text.trim().length === 0) {
					new Notice('No text to type');
					return;
				}

				try {
					// Create chunks from text using configured chunk size
					const strategy = ChunkingStrategy.wordBased(this.settings.typingChunkSize);
					const sequence = ChunkingService.chunk(text, strategy);

					// Create base match strategy based on setting
					let matchStrategy: MatchStrategy;
					switch (this.settings.typingMatchStrategy) {
						case 'strict':
							matchStrategy = new StrictMatchStrategy();
							break;
						case 'fuzzy':
							matchStrategy = new FuzzyMatchStrategy(this.settings.typingFuzzyThreshold);
							break;
						case 'lenient':
						default:
							matchStrategy = new LenientMatchStrategy();
							break;
					}

					// Wrap with punctuation stripping if enabled
					if (this.settings.typingStripPunctuation) {
						matchStrategy = new PunctuationStrippingMatchStrategy(matchStrategy);
					}

					// Create typing session with configured strategy
					const session = new TypingSession(sequence, matchStrategy);

					// Create and show player with settings access
					const player = new TypingPlayer(this.app, session, this);
					player.show();

				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error('Touch typing error:', error);
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

