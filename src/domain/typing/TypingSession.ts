import { ChunkSequence } from '../chunking/ChunkSequence';
import { Chunk } from '../chunking/Chunk';
import { MatchStrategy } from './MatchStrategy';
import { LenientMatchStrategy } from './LenientMatchStrategy';
import { StrictMatchStrategy } from './StrictMatchStrategy';
import { FuzzyMatchStrategy } from './FuzzyMatchStrategy';
import { TypingMatch } from './TypingMatch';
import { TypingAttempt } from './TypingAttempt';
import { TypingStatistics } from './TypingStatistics';
import { TypingSessionState, TypingSessionConfig } from './TypingSessionState';
import { TypingComparisonService } from './TypingComparisonService';

/**
 * TypingSession - Aggregate Root
 * 
 * Manages an active typing-based reading session where users progress
 * through text chunks by typing them rather than automatic timer progression.
 * 
 * Responsibilities:
 * - Track current position in chunk sequence
 * - Record typing attempts (successes and failures)
 * - Apply match strategy for input comparison
 * - Enforce progression rules (must match to advance)
 * - Calculate session statistics
 */
export class TypingSession {
    private readonly chunks: ChunkSequence;
    private readonly strategy: MatchStrategy;
    private readonly comparisonService: TypingComparisonService;
    private readonly config: Required<TypingSessionConfig>;
    
    private _state: TypingSessionState;
    private _currentIndex: number;
    private readonly _attempts: TypingAttempt[];
    private readonly _startTime: number;
    private _endTime?: number;

    constructor(
        chunks: ChunkSequence,
        strategy?: MatchStrategy,
        config?: TypingSessionConfig
    ) {
        // Validation
        if (chunks.length === 0) {
            throw new Error('Session must have at least one chunk');
        }

        this.chunks = chunks;
        this.strategy = strategy || new LenientMatchStrategy();
        this.comparisonService = new TypingComparisonService();
        
        // Apply default config
        this.config = {
            allowRetries: config?.allowRetries ?? true,
            caseSensitive: config?.caseSensitive ?? false,
            fuzzyThreshold: config?.fuzzyThreshold ?? 2
        };

        this._state = TypingSessionState.IDLE;
        this._currentIndex = 0;
        this._attempts = [];
        this._startTime = Date.now();
    }

    /**
     * Factory method for lenient matching (case-insensitive, trim whitespace)
     */
    static withLenientMatching(chunks: ChunkSequence, config?: TypingSessionConfig): TypingSession {
        return new TypingSession(chunks, new LenientMatchStrategy(), config);
    }

    /**
     * Factory method for strict matching (exact match required)
     */
    static withStrictMatching(chunks: ChunkSequence, config?: TypingSessionConfig): TypingSession {
        return new TypingSession(chunks, new StrictMatchStrategy(), config);
    }

    /**
     * Factory method for fuzzy matching (typo-tolerant)
     */
    static withFuzzyMatching(
        chunks: ChunkSequence,
        threshold: number = 2,
        config?: TypingSessionConfig
    ): TypingSession {
        return new TypingSession(chunks, new FuzzyMatchStrategy(threshold), config);
    }

    // ===== State Accessors =====

    get state(): TypingSessionState {
        return this._state;
    }

    get currentIndex(): number {
        return this._currentIndex;
    }

    get currentChunk(): Chunk | null {
        return this.chunks.getChunk(this._currentIndex);
    }

    get totalChunks(): number {
        return this.chunks.length;
    }

    get isComplete(): boolean {
        return this._state === TypingSessionState.COMPLETED;
    }

    get attempts(): ReadonlyArray<TypingAttempt> {
        return this._attempts;
    }

    get startTime(): number {
        return this._startTime;
    }

    get endTime(): number | undefined {
        return this._endTime;
    }

    get sessionDuration(): number {
        if (this._endTime) {
            return this._endTime - this._startTime;
        }
        return Date.now() - this._startTime;
    }

    get matchStrategy(): MatchStrategy {
        return this.strategy;
    }

    // ===== Commands =====

    /**
     * Start the typing session
     * Transitions: IDLE → AWAITING_INPUT
     */
    start(): void {
        if (this._state !== TypingSessionState.IDLE) {
            throw new Error('Session already started');
        }
        this._state = TypingSessionState.AWAITING_INPUT;
    }

    /**
     * Submit user input for the current chunk
     * 
     * @param input - User's typed input
     * @returns TypingMatch result indicating success/failure
     * 
     * Transitions:
     * - AWAITING_INPUT + correct → AWAITING_INPUT (next chunk) or COMPLETED (last chunk)
     * - AWAITING_INPUT + incorrect → AWAITING_INPUT (retry same chunk)
     */
    submitInput(input: string): TypingMatch {
        if (this._state !== TypingSessionState.AWAITING_INPUT) {
            throw new Error(`Cannot submit input in state: ${this._state}`);
        }

        const currentChunk = this.currentChunk;
        if (!currentChunk) {
            throw new Error('No current chunk available');
        }

        // Compare input to target using strategy
        const match = this.comparisonService.compare(
            input,
            currentChunk.content,
            this.strategy
        );

        // Record the attempt
        const attempt = new TypingAttempt(
            match,
            Date.now(),
            0 // Duration will be calculated by services later if needed
        );
        this._attempts.push(attempt);

        // Handle match result
        if (match.isMatch) {
            this.advanceToNextChunk();
        } else if (!this.config.allowRetries) {
            throw new Error('Retries not allowed - incorrect input');
        }

        return match;
    }

    /**
     * Reset session to initial state (for retry)
     */
    reset(): void {
        this._state = TypingSessionState.IDLE;
        this._currentIndex = 0;
        this._attempts.length = 0; // Clear attempts array
        this._endTime = undefined;
    }

    // ===== Queries =====

    /**
     * Get current statistics for the session
     */
    getStatistics(): TypingStatistics {
        return new TypingStatistics(this._attempts);
    }

    /**
     * Get progress as a percentage (0-100)
     */
    getProgress(): number {
        return Math.round((this._currentIndex / this.totalChunks) * 100);
    }

    /**
     * Get number of attempts for current chunk
     */
    getAttemptsForCurrentChunk(): number {
        if (!this.currentChunk) return 0;
        
        // Count attempts since last successful chunk
        const lastSuccessIndex = this._attempts.findLastIndex(a => a.isCorrect);
        if (lastSuccessIndex === -1) {
            // No successful attempts yet, count all
            return this._attempts.length;
        }
        
        return this._attempts.length - lastSuccessIndex - 1;
    }

    /**
     * Check if current chunk has been attempted
     */
    hasAttemptedCurrentChunk(): boolean {
        return this.getAttemptsForCurrentChunk() > 0;
    }

    // ===== Private Methods =====

    private advanceToNextChunk(): void {
        this._currentIndex++;

        if (this._currentIndex >= this.chunks.length) {
            // All chunks completed
            this._state = TypingSessionState.COMPLETED;
            this._endTime = Date.now();
        } else {
            // More chunks remaining
            this._state = TypingSessionState.AWAITING_INPUT;
        }
    }

    // ===== Invariant Checks (for testing) =====

    /**
     * Verify session invariants hold
     * Useful for property-based testing and debugging
     */
    checkInvariants(): void {
        // 1. Current index within bounds
        if (this._currentIndex < 0 || this._currentIndex > this.chunks.length) {
            throw new Error('Invariant violated: currentIndex out of bounds');
        }

        // 2. If completed, current index must equal chunk count
        if (this._state === TypingSessionState.COMPLETED && this._currentIndex !== this.chunks.length) {
            throw new Error('Invariant violated: completed but not at end');
        }

        // 3. If not completed, current index must be less than chunk count
        if (this._state !== TypingSessionState.COMPLETED && this._currentIndex >= this.chunks.length) {
            throw new Error('Invariant violated: not completed but at end');
        }

        // 4. Can't have end time without being completed
        if (this._endTime && this._state !== TypingSessionState.COMPLETED) {
            throw new Error('Invariant violated: end time set but not completed');
        }

        // 5. Attempts should never be empty after starting (if any input submitted)
        // (This is not strictly an invariant, just a sanity check)
    }
}

