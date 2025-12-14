import { MatchStrategy } from './MatchStrategy';

/**
 * FuzzyMatchStrategy
 * 
 * Allows minor typos using Levenshtein distance (edit distance).
 * Balances speed and accuracy - tolerates 1-2 character errors.
 * 
 * Default max distance: 2 (can be configured)
 * 
 * Examples:
 * - "Hello" matches "Helo" ✓ (1 deletion)
 * - "Hello" matches "Helol" ✓ (1 transposition)
 * - "Hello" matches "Hllo" ✓ (1 deletion)
 * - "Hello" does NOT match "Heo" ✗ (2 deletions + 1 extra = too far)
 */
export class FuzzyMatchStrategy implements MatchStrategy {
	readonly name = 'fuzzy';
	private readonly maxDistance: number;

	/**
	 * @param maxDistance - Maximum edit distance allowed (default: 2)
	 */
	constructor(maxDistance: number = 2) {
		if (maxDistance < 0) {
			throw new Error('Max distance must be non-negative');
		}
		this.maxDistance = maxDistance;
	}

	matches(input: string, target: string): boolean {
		// Normalize for comparison (case-insensitive + trim)
		const normalizedInput = input.trim().toLowerCase();
		const normalizedTarget = target.trim().toLowerCase();
		
		const distance = this.levenshteinDistance(normalizedInput, normalizedTarget);
		return distance <= this.maxDistance;
	}

	/**
	 * Calculate Levenshtein distance (minimum edit distance) between two strings
	 * 
	 * @param a - First string
	 * @param b - Second string
	 * @returns Minimum number of single-character edits (insertions, deletions, substitutions)
	 */
	private levenshteinDistance(a: string, b: string): number {
		// Handle edge cases
		if (a === b) return 0;
		if (a.length === 0) return b.length;
		if (b.length === 0) return a.length;

		// Create matrix for dynamic programming
		// matrix[i][j] = distance between a[0..i-1] and b[0..j-1]
		const matrix: number[][] = [];

		// Initialize first row (distance from empty string to b)
		for (let j = 0; j <= b.length; j++) {
			matrix[0] = matrix[0] || [];
			matrix[0][j] = j;
		}

		// Initialize first column (distance from empty string to a)
		for (let i = 0; i <= a.length; i++) {
			matrix[i] = matrix[i] || [];
			matrix[i][0] = i;
		}

		// Fill in the rest of the matrix
		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				if (a.charAt(i - 1) === b.charAt(j - 1)) {
					// Characters match, no edit needed
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					// Characters don't match, take minimum of:
					// - substitution: matrix[i-1][j-1] + 1
					// - insertion: matrix[i][j-1] + 1
					// - deletion: matrix[i-1][j] + 1
					matrix[i][j] = Math.min(
						matrix[i - 1][j - 1] + 1, // substitution
						matrix[i][j - 1] + 1,     // insertion
						matrix[i - 1][j] + 1      // deletion
					);
				}
			}
		}

		return matrix[a.length][b.length];
	}
}

