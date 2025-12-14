export interface ArchetypeSettings {
	// Speed Reading Settings
	speedReadingWPM: number;
	speedReadingChunkSize: number;
	
	// Touch Typing Settings
	typingChunkSize: number;
	typingMatchStrategy: 'lenient' | 'strict' | 'fuzzy';
	typingFuzzyThreshold: number;
}
