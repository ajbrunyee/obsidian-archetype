import { MatchStrategy } from './MatchStrategy';

/**
 * PunctuationStrippingMatchStrategy - Decorator Pattern
 * 
 * Wraps another match strategy and strips punctuation before comparing.
 * This allows "domain" to match "domain" (with quotes) or domain. (with period)
 */
export class PunctuationStrippingMatchStrategy implements MatchStrategy {
	readonly name: string;
	private readonly wrappedStrategy: MatchStrategy;

	constructor(wrappedStrategy: MatchStrategy) {
		this.wrappedStrategy = wrappedStrategy;
		this.name = `${wrappedStrategy.name}-no-punctuation`;
	}

	matches(input: string, target: string): boolean {
		const strippedInput = this.stripPunctuation(input);
		const strippedTarget = this.stripPunctuation(target);
		
		return this.wrappedStrategy.matches(strippedInput, strippedTarget);
	}

	/**
	 * Remove common punctuation marks from text
	 * Punctuation that can separate words (dashes, slashes) is replaced with spaces
	 * Other punctuation is simply removed
	 * Multiple spaces are normalized to single spaces
	 */
	private stripPunctuation(text: string): string {
		// First, replace word-separating punctuation with spaces
		// Includes: em dash (U+2014), en dash (U+2013), hyphens, slashes
		let cleaned = text.replace(/[\u2013\u2014\-\/\\]/g, ' ');
		
		// Then remove other punctuation
		// Includes: quotes (straight and curly U+2018-U+201F), periods, commas, etc.
		cleaned = cleaned.replace(/['""\u2018-\u201F\.,;:!?\(\)\[\]\{\}<>@#\$%\^&\*+=_`~|]/g, '');
		
		// Normalize whitespace: multiple spaces → single space, trim edges
		cleaned = cleaned.replace(/\s+/g, ' ').trim();
		
		return cleaned;
	}
}

