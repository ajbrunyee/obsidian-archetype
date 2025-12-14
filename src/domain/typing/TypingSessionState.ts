/**
 * TypingSession State Machine
 * 
 * IDLE → start() → AWAITING_INPUT
 * AWAITING_INPUT → submitInput(correct) → AWAITING_INPUT (next chunk)
 * AWAITING_INPUT → submitInput(incorrect) → AWAITING_INPUT (retry)
 * AWAITING_INPUT → submitInput(correct, last chunk) → COMPLETED
 */
export enum TypingSessionState {
    IDLE = 'idle',                      // Not started
    AWAITING_INPUT = 'awaiting_input',  // Waiting for user input
    COMPLETED = 'completed'             // All chunks typed successfully
}

export interface TypingSessionConfig {
    allowRetries?: boolean;  // Allow multiple attempts per chunk (default: true)
    caseSensitive?: boolean; // Use strict matching (default: false, uses lenient)
    fuzzyThreshold?: number; // If using fuzzy matching, max Levenshtein distance (default: 2)
}

