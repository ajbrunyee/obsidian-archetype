import { describe, it, expect } from 'vitest';
import { ChunkTiming, MIN_DISPLAY_DURATION, MAX_DISPLAY_DURATION } from './ChunkTiming';
import { ReadingSpeed } from './ReadingSpeed';
import { Chunk } from '../chunking/Chunk';

describe('ChunkTiming', () => {
	describe('creation', () => {
		it('should create with valid reading speed', () => {
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);
			expect(timing.readingSpeed.wpm).toBe(300);
		});
	});

	describe('calculateDuration()', () => {
		it('should calculate correct duration for multi-word chunk', () => {
			// At 300 WPM: 3 words = (3/300) * 60000 = 600ms
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('The quick brown', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(600);
		});

		it('should calculate correct duration for single word', () => {
			// At 300 WPM: 1 word = (1/300) * 60000 = 200ms
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('Hello', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(200);
		});

		it('should apply minimum duration constraint', () => {
			// At 600 WPM: 1 word = (1/600) * 60000 = 100ms (at the minimum)
			const speed = ReadingSpeed.fromWPM(600);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('A', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBeGreaterThanOrEqual(MIN_DISPLAY_DURATION);
		});

		it('should apply minimum duration for very fast WPM', () => {
			// At 1000 WPM: 1 word = (1/1000) * 60000 = 60ms -> constrained to 100ms
			const speed = ReadingSpeed.fromWPM(1000);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('Fast', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(MIN_DISPLAY_DURATION);
		});

		it('should apply maximum duration constraint', () => {
			// At 50 WPM: 100 words = (100/50) * 60000 = 120000ms -> constrained to 10000ms
			const speed = ReadingSpeed.fromWPM(50);
			const timing = new ChunkTiming(speed);
			// Create a chunk with many words
			const longText = Array(100).fill('word').join(' ');
			const chunk = new Chunk(longText, 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(MAX_DISPLAY_DURATION);
		});

		it('should return integer milliseconds', () => {
			const speed = ReadingSpeed.fromWPM(250);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('One two', 0);

			const duration = timing.calculateDuration(chunk);
			expect(Number.isInteger(duration)).toBe(true);
		});

		it('should handle different WPM values correctly', () => {
			const chunk = new Chunk('The quick brown', 0); // 3 words

			// At 200 WPM: (3/200) * 60000 = 900ms
			const slow = new ChunkTiming(ReadingSpeed.fromWPM(200));
			expect(slow.calculateDuration(chunk)).toBe(900);

			// At 300 WPM: (3/300) * 60000 = 600ms
			const normal = new ChunkTiming(ReadingSpeed.fromWPM(300));
			expect(normal.calculateDuration(chunk)).toBe(600);

			// At 450 WPM: (3/450) * 60000 = 400ms
			const fast = new ChunkTiming(ReadingSpeed.fromWPM(450));
			expect(fast.calculateDuration(chunk)).toBe(400);
		});

		it('should handle single character chunk', () => {
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('X', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBeGreaterThanOrEqual(MIN_DISPLAY_DURATION);
		});

		it('should handle chunk with punctuation', () => {
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('Hello, world!', 0); // 2 words

			// At 300 WPM: (2/300) * 60000 = 400ms
			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(400);
		});
	});

	describe('formula verification', () => {
		it('should use formula: (wordCount / WPM) * 60000', () => {
			const wpm = 240;
			const wordCount = 4;
			const expectedDuration = Math.round((wordCount / wpm) * 60000); // = 1000ms

			const speed = ReadingSpeed.fromWPM(wpm);
			const timing = new ChunkTiming(speed);
			const chunk = new Chunk('One two three four', 0);

			const duration = timing.calculateDuration(chunk);
			expect(duration).toBe(expectedDuration);
			expect(duration).toBe(1000);
		});
	});

	describe('immutability', () => {
		it('should not allow modification of reading speed', () => {
			const speed = ReadingSpeed.fromWPM(300);
			const timing = new ChunkTiming(speed);

			expect(timing.readingSpeed.wpm).toBe(300);
			// TypeScript prevents: timing.readingSpeed = ReadingSpeed.fromWPM(400);
		});
	});
});

