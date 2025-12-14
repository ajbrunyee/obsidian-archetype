import { describe, it, expect, beforeEach } from 'vitest';
import { TypingSession } from './TypingSession';
import { ChunkSequence } from '../chunking/ChunkSequence';
import { Chunk } from '../chunking/Chunk';
import { TypingSessionState } from './TypingSessionState';
import { LenientMatchStrategy } from './LenientMatchStrategy';
import { StrictMatchStrategy } from './StrictMatchStrategy';
import { FuzzyMatchStrategy } from './FuzzyMatchStrategy';

describe('TypingSession', () => {
    let chunks: ChunkSequence;

    beforeEach(() => {
        chunks = new ChunkSequence([
            new Chunk('Hello', 0),
            new Chunk('World', 1),
            new Chunk('Test', 2)
        ]);
    });

    describe('constructor', () => {
        it('should create session in IDLE state', () => {
            const session = new TypingSession(chunks);

            expect(session.state).toBe(TypingSessionState.IDLE);
            expect(session.currentIndex).toBe(0);
            expect(session.totalChunks).toBe(3);
            expect(session.isComplete).toBe(false);
        });

        it('should throw error for empty chunk sequence', () => {
            const emptyChunks = new ChunkSequence([]);

            expect(() => new TypingSession(emptyChunks)).toThrow('Session must have at least one chunk');
        });

        it('should use lenient strategy by default', () => {
            const session = new TypingSession(chunks);
            session.start();

            // Lenient allows different case
            const match = session.submitInput('hello');
            expect(match.isMatch).toBe(true);
        });

        it('should accept custom strategy', () => {
            const strictStrategy = new StrictMatchStrategy();
            const session = new TypingSession(chunks, strictStrategy);
            session.start();

            // Strict requires exact match
            const match = session.submitInput('hello');
            expect(match.isMatch).toBe(false);
        });

        it('should initialize with start time', () => {
            const before = Date.now();
            const session = new TypingSession(chunks);
            const after = Date.now();

            expect(session.startTime).toBeGreaterThanOrEqual(before);
            expect(session.startTime).toBeLessThanOrEqual(after);
        });

        it('should initialize with empty attempts', () => {
            const session = new TypingSession(chunks);

            expect(session.attempts).toHaveLength(0);
        });
    });

    describe('factory methods', () => {
        it('should create session with lenient matching', () => {
            const session = TypingSession.withLenientMatching(chunks);
            session.start();

            const match = session.submitInput('HELLO');
            expect(match.isMatch).toBe(true);
        });

        it('should create session with strict matching', () => {
            const session = TypingSession.withStrictMatching(chunks);
            session.start();

            const match = session.submitInput('HELLO');
            expect(match.isMatch).toBe(false);
        });

        it('should create session with fuzzy matching', () => {
            const session = TypingSession.withFuzzyMatching(chunks, 2);
            session.start();

            // 'Helo' is 1 edit distance from 'Hello'
            const match = session.submitInput('Helo');
            expect(match.isMatch).toBe(true);
        });
    });

    describe('start', () => {
        it('should transition from IDLE to AWAITING_INPUT', () => {
            const session = new TypingSession(chunks);
            
            expect(session.state).toBe(TypingSessionState.IDLE);
            session.start();
            expect(session.state).toBe(TypingSessionState.AWAITING_INPUT);
        });

        it('should throw error if already started', () => {
            const session = new TypingSession(chunks);
            session.start();

            expect(() => session.start()).toThrow('Session already started');
        });

        it('should not advance current index', () => {
            const session = new TypingSession(chunks);
            session.start();

            expect(session.currentIndex).toBe(0);
        });
    });

    describe('submitInput', () => {
        it('should throw error if not started', () => {
            const session = new TypingSession(chunks);

            expect(() => session.submitInput('Hello')).toThrow('Cannot submit input in state: idle');
        });

        it('should throw error if completed', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();
            session.submitInput('Hello');

            expect(() => session.submitInput('anything')).toThrow('Cannot submit input in state: completed');
        });

        it('should record attempt', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Hello');

            expect(session.attempts).toHaveLength(1);
            expect(session.attempts[0].input).toBe('Hello');
            expect(session.attempts[0].target).toBe('Hello');
        });

        it('should advance on correct input', () => {
            const session = new TypingSession(chunks);
            session.start();

            const match = session.submitInput('Hello');

            expect(match.isMatch).toBe(true);
            expect(session.currentIndex).toBe(1);
            expect(session.currentChunk?.content).toBe('World');
        });

        it('should not advance on incorrect input', () => {
            const session = new TypingSession(chunks);
            session.start();

            const match = session.submitInput('Wrong');

            expect(match.isMatch).toBe(false);
            expect(session.currentIndex).toBe(0);
            expect(session.currentChunk?.content).toBe('Hello');
        });

        it('should allow multiple attempts on same chunk', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Wrong1');
            session.submitInput('Wrong2');
            session.submitInput('Hello'); // Correct

            expect(session.attempts).toHaveLength(3);
            expect(session.currentIndex).toBe(1);
        });

        it('should complete session on last chunk', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();

            session.submitInput('Hello');

            expect(session.state).toBe(TypingSessionState.COMPLETED);
            expect(session.isComplete).toBe(true);
            expect(session.endTime).toBeDefined();
        });

        it('should respect allowRetries config', () => {
            const session = new TypingSession(chunks, undefined, { allowRetries: false });
            session.start();

            expect(() => session.submitInput('Wrong')).toThrow('Retries not allowed');
        });
    });

    describe('progression through chunks', () => {
        it('should progress through all chunks with correct input', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Hello');
            expect(session.currentIndex).toBe(1);
            expect(session.currentChunk?.content).toBe('World');

            session.submitInput('World');
            expect(session.currentIndex).toBe(2);
            expect(session.currentChunk?.content).toBe('Test');

            session.submitInput('Test');
            expect(session.currentIndex).toBe(3);
            expect(session.currentChunk).toBeNull();
            expect(session.isComplete).toBe(true);
        });

        it('should handle mixed correct and incorrect attempts', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Wrong');   // Attempt 1: Fail
            session.submitInput('Hello');   // Attempt 2: Success, advance
            session.submitInput('World');   // Attempt 3: Success, advance
            session.submitInput('Bad');     // Attempt 4: Fail
            session.submitInput('Test');    // Attempt 5: Success, complete

            expect(session.attempts).toHaveLength(5);
            expect(session.isComplete).toBe(true);
        });
    });

    describe('currentChunk', () => {
        it('should return first chunk initially', () => {
            const session = new TypingSession(chunks);

            expect(session.currentChunk?.content).toBe('Hello');
        });

        it('should return null when completed', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();
            session.submitInput('Hello');

            expect(session.currentChunk).toBeNull();
        });

        it('should update as session progresses', () => {
            const session = new TypingSession(chunks);
            session.start();

            expect(session.currentChunk?.content).toBe('Hello');
            session.submitInput('Hello');
            expect(session.currentChunk?.content).toBe('World');
            session.submitInput('World');
            expect(session.currentChunk?.content).toBe('Test');
        });
    });

    describe('reset', () => {
        it('should reset session to initial state', () => {
            const session = new TypingSession(chunks);
            session.start();
            session.submitInput('Hello');
            session.submitInput('World');

            session.reset();

            expect(session.state).toBe(TypingSessionState.IDLE);
            expect(session.currentIndex).toBe(0);
            expect(session.attempts).toHaveLength(0);
            expect(session.endTime).toBeUndefined();
        });

        it('should allow restarting after reset', () => {
            const session = new TypingSession(chunks);
            session.start();
            session.submitInput('Hello');
            session.reset();

            session.start();
            session.submitInput('Hello');

            expect(session.currentIndex).toBe(1);
        });
    });

    describe('getStatistics', () => {
        it('should return statistics for session', () => {
            const session = new TypingSession(chunks);
            session.start();
            session.submitInput('Hello');
            session.submitInput('Wrong');
            session.submitInput('World');

            const stats = session.getStatistics();

            expect(stats.totalAttempts).toBe(3);
            expect(stats.successfulAttempts).toBe(2);
            expect(stats.totalErrors).toBe(1);
        });

        it('should return empty stats for new session', () => {
            const session = new TypingSession(chunks);

            const stats = session.getStatistics();

            expect(stats.totalAttempts).toBe(0);
            expect(stats.successfulAttempts).toBe(0);
        });
    });

    describe('getProgress', () => {
        it('should return 0 for new session', () => {
            const session = new TypingSession(chunks);

            expect(session.getProgress()).toBe(0);
        });

        it('should return percentage of completed chunks', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Hello');
            expect(session.getProgress()).toBe(33); // 1/3 = 33%

            session.submitInput('World');
            expect(session.getProgress()).toBe(67); // 2/3 = 67%

            session.submitInput('Test');
            expect(session.getProgress()).toBe(100); // 3/3 = 100%
        });
    });

    describe('getAttemptsForCurrentChunk', () => {
        it('should return 0 for new session', () => {
            const session = new TypingSession(chunks);

            expect(session.getAttemptsForCurrentChunk()).toBe(0);
        });

        it('should count attempts for current chunk', () => {
            const session = new TypingSession(chunks);
            session.start();

            expect(session.getAttemptsForCurrentChunk()).toBe(0);

            session.submitInput('Wrong1');
            expect(session.getAttemptsForCurrentChunk()).toBe(1);

            session.submitInput('Wrong2');
            expect(session.getAttemptsForCurrentChunk()).toBe(2);

            session.submitInput('Hello'); // Advance
            expect(session.getAttemptsForCurrentChunk()).toBe(0); // Reset for new chunk
        });

        it('should return 0 when completed', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();
            session.submitInput('Hello');

            expect(session.getAttemptsForCurrentChunk()).toBe(0);
        });
    });

    describe('hasAttemptedCurrentChunk', () => {
        it('should return false for new session', () => {
            const session = new TypingSession(chunks);

            expect(session.hasAttemptedCurrentChunk()).toBe(false);
        });

        it('should return true after attempt', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Wrong');
            expect(session.hasAttemptedCurrentChunk()).toBe(true);
        });

        it('should return false after advancing to next chunk', () => {
            const session = new TypingSession(chunks);
            session.start();

            session.submitInput('Hello');
            expect(session.hasAttemptedCurrentChunk()).toBe(false);
        });
    });

    describe('sessionDuration', () => {
        it('should return elapsed time', () => {
            const session = new TypingSession(chunks);
            
            const duration1 = session.sessionDuration;
            expect(duration1).toBeGreaterThanOrEqual(0);

            // Wait a bit
            const start = Date.now();
            while (Date.now() - start < 10) {
                // Busy wait
            }

            const duration2 = session.sessionDuration;
            expect(duration2).toBeGreaterThan(duration1);
        });

        it('should return final duration when completed', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();
            session.submitInput('Hello');

            const duration1 = session.sessionDuration;
            const duration2 = session.sessionDuration;

            // Should be stable after completion
            expect(duration1).toBe(duration2);
        });
    });

    describe('checkInvariants', () => {
        it('should not throw for valid session', () => {
            const session = new TypingSession(chunks);

            expect(() => session.checkInvariants()).not.toThrow();

            session.start();
            expect(() => session.checkInvariants()).not.toThrow();

            session.submitInput('Hello');
            expect(() => session.checkInvariants()).not.toThrow();
        });

        it('should verify completed state', () => {
            const singleChunk = new ChunkSequence([new Chunk('Hello', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();
            session.submitInput('Hello');

            expect(() => session.checkInvariants()).not.toThrow();
            expect(session.isComplete).toBe(true);
        });
    });

    describe('strategy patterns', () => {
        it('should use lenient strategy correctly', () => {
            const session = TypingSession.withLenientMatching(chunks);
            session.start();

            // Case insensitive
            expect(session.submitInput('HELLO').isMatch).toBe(true);
            // Whitespace trimmed
            expect(session.submitInput('  World  ').isMatch).toBe(true);
        });

        it('should use strict strategy correctly', () => {
            const session = TypingSession.withStrictMatching(chunks);
            session.start();

            // Case sensitive
            expect(session.submitInput('HELLO').isMatch).toBe(false);
            expect(session.submitInput('Hello').isMatch).toBe(true);
        });

        it('should use fuzzy strategy correctly', () => {
            const session = TypingSession.withFuzzyMatching(chunks, 2);
            session.start();

            // Typos within threshold
            expect(session.submitInput('Helo').isMatch).toBe(true);    // 1 edit
            expect(session.submitInput('Wrld').isMatch).toBe(true);    // 1 edit (after advancing)
        });
    });

    describe('edge cases', () => {
        it('should handle single chunk session', () => {
            const singleChunk = new ChunkSequence([new Chunk('Test', 0)]);
            const session = new TypingSession(singleChunk);
            session.start();

            session.submitInput('Test');

            expect(session.isComplete).toBe(true);
            expect(session.currentChunk).toBeNull();
        });

        it('should handle very long chunks', () => {
            const longText = 'a'.repeat(10000);
            const longChunks = new ChunkSequence([new Chunk(longText, 0)]);
            const session = new TypingSession(longChunks);
            session.start();

            session.submitInput(longText);

            expect(session.isComplete).toBe(true);
        });

        it('should handle many failed attempts', () => {
            const session = new TypingSession(chunks);
            session.start();

            for (let i = 0; i < 100; i++) {
                session.submitInput('Wrong');
            }

            expect(session.attempts).toHaveLength(100);
            expect(session.currentIndex).toBe(0); // Still on first chunk
        });
    });

    describe('configuration', () => {
        it('should respect allowRetries: true (default)', () => {
            const session = new TypingSession(chunks, undefined, { allowRetries: true });
            session.start();

            session.submitInput('Wrong');
            session.submitInput('Hello');

            expect(session.currentIndex).toBe(1);
        });

        it('should respect allowRetries: false', () => {
            const session = new TypingSession(chunks, undefined, { allowRetries: false });
            session.start();

            expect(() => session.submitInput('Wrong')).toThrow('Retries not allowed');
        });
    });
});

