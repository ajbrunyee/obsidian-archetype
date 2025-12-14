import { MatchStrategy } from './MatchStrategy';

/**
 * LenientMatchStrategy
 * 
 * Case-insensitive comparison with whitespace trimming.
 * Most forgiving option - encourages speed over precision.
 * 
 * Examples:
 * - "Hello" matches "hello" ✓
 * - "  Hello  " matches "Hello" ✓
 * - "HELLO" matches "hello" ✓
 * - "Helo" does NOT match "Hello" ✗ (typo)
 */
export class LenientMatchStrategy implements MatchStrategy {
	readonly name = 'lenient';

	matches(input: string, target: string): boolean {
		// Normalize both strings: trim whitespace and convert to lowercase
		const normalizedInput = input.trim().toLowerCase();
		const normalizedTarget = target.trim().toLowerCase();
		
		return normalizedInput === normalizedTarget;
	}
}

