import { ArchetypeSettings } from './types';

export const DEFAULT_SETTINGS: ArchetypeSettings = {
	// Speed Reading Settings
	speedReadingWPM: 300,
	speedReadingChunkSize: 3,
	
	// Touch Typing Settings
	typingChunkSize: 1,  // Default to 1 word at a time
	typingMatchStrategy: 'lenient',
	typingFuzzyThreshold: 2,
	typingStripPunctuation: true  // Strip punctuation by default (quotes, periods, etc.)
}
