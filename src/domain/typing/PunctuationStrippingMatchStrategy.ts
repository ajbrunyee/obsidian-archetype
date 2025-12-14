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
	 * Keeps only letters, numbers, and whitespace
	 */
	private stripPunctuation(text: string): string {
		// Remove: quotes (single, double, curly), periods, commas, semicolons, colons,
		// exclamation marks, question marks, hyphens, parentheses, brackets, etc.
		// Unicode ranges for curly quotes: \u2018-\u201F covers all curly quotes and apostrophes
		return text.replace(/['""\u2018-\u201F\.,;:!?\-\(\)\[\]\{\}<>\/\\@#\$%\^&\*+=_`~|]/g, '');
	}
}

