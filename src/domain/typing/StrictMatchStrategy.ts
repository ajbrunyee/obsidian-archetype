import { MatchStrategy } from './MatchStrategy';

/**
 * StrictMatchStrategy
 * 
 * Exact character-by-character comparison.
 * Most demanding option - requires perfect typing.
 * 
 * Examples:
 * - "Hello" matches "Hello" ✓
 * - "hello" does NOT match "Hello" ✗ (case)
 * - " Hello" does NOT match "Hello" ✗ (whitespace)
 */
export class StrictMatchStrategy implements MatchStrategy {
	readonly name = 'strict';

	matches(input: string, target: string): boolean {
		return input === target;
	}
}

