import { describe, it, expect } from 'vitest';
import { ReadingSpeed } from './ReadingSpeed';

describe('ReadingSpeed', () => {
	describe('creation', () => {
		it('should create with valid WPM', () => {
			const speed = ReadingSpeed.fromWPM(300);
			expect(speed.wpm).toBe(300);
		});

		it('should reject non-positive WPM', () => {
			expect(() => ReadingSpeed.fromWPM(0)).toThrow('Reading speed must be positive');
			expect(() => ReadingSpeed.fromWPM(-100)).toThrow('Reading speed must be positive');
		});

		it('should accept decimal WPM values', () => {
			const speed = ReadingSpeed.fromWPM(250.5);
			expect(speed.wpm).toBe(250.5);
		});
	});

	describe('predefined speeds', () => {
		it('should have SLOW speed at 200 WPM', () => {
			expect(ReadingSpeed.SLOW.wpm).toBe(200);
		});

		it('should have NORMAL speed at 300 WPM', () => {
			expect(ReadingSpeed.NORMAL.wpm).toBe(300);
		});

		it('should have FAST speed at 450 WPM', () => {
			expect(ReadingSpeed.FAST.wpm).toBe(450);
		});
	});

	describe('equality', () => {
		it('should be equal when WPM matches', () => {
			const speed1 = ReadingSpeed.fromWPM(300);
			const speed2 = ReadingSpeed.fromWPM(300);
			expect(speed1.equals(speed2)).toBe(true);
		});

		it('should not be equal when WPM differs', () => {
			const speed1 = ReadingSpeed.fromWPM(300);
			const speed2 = ReadingSpeed.fromWPM(400);
			expect(speed1.equals(speed2)).toBe(false);
		});
	});

	describe('immutability', () => {
		it('should not allow modification of WPM', () => {
			const speed = ReadingSpeed.fromWPM(300);
			// TypeScript compilation will prevent this, but we document the expectation
			expect(speed.wpm).toBe(300);
			// Attempting to assign would be a compile error: speed.wpm = 400;
		});
	});
});

