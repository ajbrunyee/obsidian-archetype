/**
 * MatchStrategy - Strategy Pattern Interface
 * 
 * Defines how user input is compared to target text for typing validation.
 */
export interface MatchStrategy {
	/**
	 * Determines if the user's input matches the target text
	 * according to this strategy's rules.
	 * 
	 * @param input - The text the user typed
	 * @param target - The text they should have typed
	 * @returns true if input matches target according to this strategy
	 */
	matches(input: string, target: string): boolean;
	
	/**
	 * Human-readable name for this strategy
	 */
	readonly name: string;
}

