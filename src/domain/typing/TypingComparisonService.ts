import { MatchStrategy } from './MatchStrategy';
import { TypingMatch } from './TypingMatch';

/**
 * Domain service for comparing user input to target text.
 * Uses the Strategy pattern to support different matching algorithms.
 */
export class TypingComparisonService {
    /**
     * Compares user input against target text using the provided strategy.
     * 
     * @param input - The text the user typed
     * @param target - The text the user should have typed
     * @param strategy - The matching strategy to use (lenient, strict, fuzzy)
     * @returns A TypingMatch containing the comparison result
     */
    compare(input: string, target: string, strategy: MatchStrategy): TypingMatch {
        const isMatch = strategy.matches(input, target);
        return new TypingMatch(input, target, isMatch, strategy);
    }

    /**
     * Performs a batch comparison of multiple inputs against targets.
     * Useful for validating a sequence of typing attempts.
     * 
     * @param pairs - Array of input-target pairs to compare
     * @param strategy - The matching strategy to use
     * @returns Array of TypingMatch results in the same order
     */
    compareBatch(
        pairs: Array<{ input: string; target: string }>,
        strategy: MatchStrategy
    ): TypingMatch[] {
        return pairs.map(({ input, target }) => this.compare(input, target, strategy));
    }
}

