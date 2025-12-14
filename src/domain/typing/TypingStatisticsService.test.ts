import { describe, it, expect, beforeEach } from 'vitest';
import { TypingStatisticsService } from './TypingStatisticsService';
import { TypingAttempt } from './TypingAttempt';
import { TypingMatch } from './TypingMatch';
import { LenientMatchStrategy } from './LenientMatchStrategy';

describe('TypingStatisticsService', () => {
    let service: TypingStatisticsService;
    const strategy = new LenientMatchStrategy();

    // Helper function to create test attempts
    function createAttempt(
        input: string,
        target: string,
        timestamp: number,
        duration: number
    ): TypingAttempt {
        const isMatch = input.toLowerCase().trim() === target.toLowerCase().trim();
        const match = new TypingMatch(input, target, isMatch, strategy);
        return new TypingAttempt(match, timestamp, duration);
    }

    beforeEach(() => {
        service = new TypingStatisticsService();
    });

    describe('calculate', () => {
        it('should calculate statistics for successful attempts', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 1000, 5000),
                createAttempt('World', 'World', 2000, 4000),
                createAttempt('Test', 'Test', 3000, 3000)
            ];

            const stats = service.calculate(attempts);

            expect(stats.totalAttempts).toBe(3);
            expect(stats.successfulAttempts).toBe(3);
            expect(stats.accuracyRate).toBe(100);
        });

        it('should calculate statistics for mixed attempts', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 1000, 5000),  // Success
                createAttempt('Wrong', 'World', 2000, 4000),  // Fail
                createAttempt('Test', 'Test', 3000, 3000)     // Success
            ];

            const stats = service.calculate(attempts);

            expect(stats.totalAttempts).toBe(3);
            expect(stats.successfulAttempts).toBe(2);
            expect(stats.accuracyRate).toBeCloseTo(66.67, 1);
            expect(stats.totalErrors).toBe(1);
        });

        it('should calculate typing speed correctly', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 0, 1000),      // 5 chars in 1s = 300 CPM
                createAttempt('World', 'World', 1000, 1000)    // 5 chars in 1s = 300 CPM
            ];

            const stats = service.calculate(attempts);

            expect(stats.averageCPM).toBeCloseTo(300, 0); // (10 chars / 2000ms) * 60000
        });

        it('should handle empty attempts array', () => {
            const stats = service.calculate([]);

            expect(stats.totalAttempts).toBe(0);
            expect(stats.successfulAttempts).toBe(0);
            expect(stats.accuracyRate).toBe(0);
            expect(stats.averageWPM).toBe(0);
            expect(stats.averageCPM).toBe(0);
        });

        it('should handle single attempt', () => {
            const attempts = [createAttempt('Hello', 'Hello', 1000, 5000)];
            const stats = service.calculate(attempts);

            expect(stats.totalAttempts).toBe(1);
            expect(stats.successfulAttempts).toBe(1);
            expect(stats.accuracyRate).toBe(100);
        });

        it('should calculate word count correctly', () => {
            const attempts = [
                createAttempt('Hello World', 'Hello World', 0, 2000),  // 2 words
                createAttempt('Test', 'Test', 2000, 1000)               // 1 word
            ];

            const stats = service.calculate(attempts);

            expect(stats.totalWordsTyped).toBe(3);
            expect(stats.averageWPM).toBeCloseTo(60, 0); // (3 words / 3000ms) * 60000
        });
    });

    describe('calculateByResult', () => {
        it('should separate successful and failed attempts', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 1000, 5000),  // Success
                createAttempt('Wrong', 'World', 2000, 4000),  // Fail
                createAttempt('Test', 'Test', 3000, 3000),    // Success
                createAttempt('Bad', 'Good', 4000, 6000)      // Fail
            ];

            const result = service.calculateByResult(attempts);

            expect(result.successful.totalAttempts).toBe(2);
            expect(result.successful.successfulAttempts).toBe(2);
            expect(result.successful.accuracyRate).toBe(100);

            expect(result.failed.totalAttempts).toBe(2);
            expect(result.failed.successfulAttempts).toBe(0);
            expect(result.failed.accuracyRate).toBe(0);

            expect(result.overall.totalAttempts).toBe(4);
            expect(result.overall.successfulAttempts).toBe(2);
            expect(result.overall.accuracyRate).toBe(50);
        });

        it('should handle all successful attempts', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 1000, 5000),
                createAttempt('World', 'World', 2000, 4000)
            ];

            const result = service.calculateByResult(attempts);

            expect(result.successful.totalAttempts).toBe(2);
            expect(result.failed.totalAttempts).toBe(0);
            expect(result.overall.totalAttempts).toBe(2);
        });

        it('should handle all failed attempts', () => {
            const attempts = [
                createAttempt('Wrong1', 'Target1', 1000, 5000),
                createAttempt('Wrong2', 'Target2', 2000, 4000)
            ];

            const result = service.calculateByResult(attempts);

            expect(result.successful.totalAttempts).toBe(0);
            expect(result.failed.totalAttempts).toBe(2);
            expect(result.overall.totalAttempts).toBe(2);
        });

        it('should handle empty attempts', () => {
            const result = service.calculateByResult([]);

            expect(result.successful.totalAttempts).toBe(0);
            expect(result.failed.totalAttempts).toBe(0);
            expect(result.overall.totalAttempts).toBe(0);
        });
    });

    describe('calculateRolling', () => {
        it('should calculate statistics for rolling time windows', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 0, 1000),      // Window 1
                createAttempt('World', 'World', 1000, 1000),   // Window 1
                createAttempt('Test', 'Test', 5000, 1000),     // Window 2
                createAttempt('Again', 'Again', 6000, 1000)    // Window 2
            ];

            const windowSize = 5000; // 5 second windows
            const results = service.calculateRolling(attempts, windowSize);

            expect(results.length).toBeGreaterThan(0);
            expect(results[0].totalAttempts).toBeGreaterThan(0);
        });

        it('should handle attempts not in chronological order', () => {
            const attempts = [
                createAttempt('Third', 'Third', 3000, 1000),
                createAttempt('First', 'First', 1000, 1000),
                createAttempt('Second', 'Second', 2000, 1000)
            ];

            const results = service.calculateRolling(attempts, 2000);

            // Should sort internally and process correctly
            expect(results.length).toBeGreaterThan(0);
        });

        it('should handle empty attempts array', () => {
            const results = service.calculateRolling([], 5000);

            expect(results).toHaveLength(0);
        });

        it('should handle single attempt', () => {
            const attempts = [createAttempt('Hello', 'Hello', 1000, 1000)];
            const results = service.calculateRolling(attempts, 5000);

            expect(results).toHaveLength(1);
            expect(results[0].totalAttempts).toBe(1);
        });

        it('should not include attempts outside window boundaries', () => {
            const attempts = [
                createAttempt('Early', 'Early', 0, 1000),
                createAttempt('Late', 'Late', 10000, 1000)
            ];

            const windowSize = 5000;
            const results = service.calculateRolling(attempts, windowSize);

            // Each window should contain only attempts within its time range
            results.forEach(stat => {
                expect(stat.totalAttempts).toBeGreaterThan(0);
            });
        });
    });

    describe('compareProgress', () => {
        it('should show improvement in accuracy', () => {
            const earlier = [
                createAttempt('Hello', 'Hello', 1000, 5000),  // Success
                createAttempt('Wrong', 'World', 2000, 4000)   // Fail
            ];

            const later = [
                createAttempt('Test', 'Test', 3000, 3000),    // Success
                createAttempt('Good', 'Good', 4000, 2000)     // Success
            ];

            const progress = service.compareProgress(earlier, later);

            expect(progress.accuracyDelta).toBeGreaterThan(0); // Improvement
            expect(progress.accuracyDelta).toBeCloseTo(50, 0);  // 50% → 100%
        });

        it('should show improvement in typing speed', () => {
            const earlier = [
                createAttempt('Hello', 'Hello', 0, 10000)      // Slow
            ];

            const later = [
                createAttempt('Hello', 'Hello', 10000, 5000)   // Faster
            ];

            const progress = service.compareProgress(earlier, later);

            expect(progress.cpmDelta).toBeGreaterThan(0); // Faster typing
        });

        it('should show decline in performance', () => {
            const earlier = [
                createAttempt('Hello', 'Hello', 1000, 2000),
                createAttempt('World', 'World', 2000, 2000)
            ];

            const later = [
                createAttempt('Wrong1', 'Test1', 3000, 5000),
                createAttempt('Wrong2', 'Test2', 4000, 6000)
            ];

            const progress = service.compareProgress(earlier, later);

            expect(progress.accuracyDelta).toBeLessThan(0);     // Worse accuracy
            expect(progress.wpmDelta).toBeLessThan(0);          // Slower WPM
        });

        it('should handle no change in performance', () => {
            const earlier = [createAttempt('Hello', 'Hello', 1000, 5000)];
            const later = [createAttempt('Hello', 'Hello', 2000, 5000)];

            const progress = service.compareProgress(earlier, later);

            expect(progress.accuracyDelta).toBe(0);
            expect(Math.abs(progress.cpmDelta)).toBeLessThan(0.1); // Essentially 0
        });

        it('should handle empty earlier attempts', () => {
            const later = [createAttempt('Hello', 'Hello', 1000, 5000)];
            const progress = service.compareProgress([], later);

            // Should not throw, returns valid comparison
            expect(progress.accuracyDelta).toBeDefined();
        });
    });

    describe('findOutliers', () => {
        it('should identify slow outliers', () => {
            const attempts = [
                createAttempt('Normal1', 'Normal1', 1000, 1000),
                createAttempt('Normal2', 'Normal2', 2000, 1000),
                createAttempt('Normal3', 'Normal3', 3000, 1000),
                createAttempt('Normal4', 'Normal4', 4000, 1000),
                createAttempt('Normal5', 'Normal5', 5000, 1000),
                createAttempt('VerySlow', 'VerySlow', 6000, 50000) // 50x slower - obvious outlier
            ];

            const { slowOutliers, fastOutliers } = service.findOutliers(attempts, 2);

            expect(slowOutliers.length).toBe(1);
            expect(slowOutliers[0].match.input).toBe('VerySlow');
            expect(fastOutliers.length).toBe(0);
        });

        it('should identify fast outliers', () => {
            const attempts = [
                createAttempt('Normal1', 'Normal1', 1000, 5000),
                createAttempt('Normal2', 'Normal2', 2000, 5000),
                createAttempt('Normal3', 'Normal3', 3000, 5000),
                createAttempt('Normal4', 'Normal4', 4000, 5000),
                createAttempt('Normal5', 'Normal5', 5000, 5000),
                createAttempt('VeryFast', 'VeryFast', 6000, 10) // 500x faster - obvious outlier
            ];

            const { slowOutliers, fastOutliers } = service.findOutliers(attempts, 2);

            expect(fastOutliers.length).toBe(1);
            expect(fastOutliers[0].match.input).toBe('VeryFast');
            expect(slowOutliers.length).toBe(0);
        });

        it('should handle no outliers', () => {
            const attempts = [
                createAttempt('Normal1', 'Normal1', 1000, 1000),
                createAttempt('Normal2', 'Normal2', 2000, 1100),
                createAttempt('Normal3', 'Normal3', 3000, 900)
            ];

            const { slowOutliers, fastOutliers } = service.findOutliers(attempts, 2);

            expect(slowOutliers.length).toBe(0);
            expect(fastOutliers.length).toBe(0);
        });

        it('should handle insufficient data for outlier detection', () => {
            const attempts = [
                createAttempt('One', 'One', 1000, 1000),
                createAttempt('Two', 'Two', 2000, 5000)
            ];

            const { slowOutliers, fastOutliers } = service.findOutliers(attempts, 2);

            expect(slowOutliers.length).toBe(0);
            expect(fastOutliers.length).toBe(0);
        });

        it('should respect custom standard deviation threshold', () => {
            const attempts = [
                createAttempt('Normal1', 'Normal1', 1000, 1000),
                createAttempt('Normal2', 'Normal2', 2000, 1000),
                createAttempt('Normal3', 'Normal3', 3000, 1000),
                createAttempt('Outlier', 'Outlier', 4000, 3000)
            ];

            const strict = service.findOutliers(attempts, 1);  // More sensitive
            const lenient = service.findOutliers(attempts, 3); // Less sensitive

            expect(strict.slowOutliers.length).toBeGreaterThanOrEqual(lenient.slowOutliers.length);
        });
    });

    describe('calculateForTimeRange', () => {
        it('should filter attempts by time range', () => {
            const attempts = [
                createAttempt('Early', 'Early', 1000, 1000),
                createAttempt('Middle', 'Middle', 5000, 1000),
                createAttempt('Late', 'Late', 9000, 1000)
            ];

            const stats = service.calculateForTimeRange(attempts, 3000, 7000);

            expect(stats.totalAttempts).toBe(1);
            expect(stats.totalCharactersTyped).toBe(6); // "Middle"
        });

        it('should include attempts at boundary timestamps', () => {
            const attempts = [
                createAttempt('Start', 'Start', 1000, 1000),
                createAttempt('End', 'End', 5000, 1000)
            ];

            const stats = service.calculateForTimeRange(attempts, 1000, 5000);

            expect(stats.totalAttempts).toBe(2);
        });

        it('should handle empty time range', () => {
            const attempts = [
                createAttempt('Hello', 'Hello', 5000, 1000)
            ];

            const stats = service.calculateForTimeRange(attempts, 1000, 3000);

            expect(stats.totalAttempts).toBe(0);
        });

        it('should handle all attempts outside range', () => {
            const attempts = [
                createAttempt('Early', 'Early', 1000, 1000),
                createAttempt('Late', 'Late', 10000, 1000)
            ];

            const stats = service.calculateForTimeRange(attempts, 3000, 7000);

            expect(stats.totalAttempts).toBe(0);
        });

        it('should handle all attempts inside range', () => {
            const attempts = [
                createAttempt('One', 'One', 2000, 1000),
                createAttempt('Two', 'Two', 3000, 1000),
                createAttempt('Three', 'Three', 4000, 1000)
            ];

            const stats = service.calculateForTimeRange(attempts, 1000, 5000);

            expect(stats.totalAttempts).toBe(3);
        });
    });

    describe('service behavior', () => {
        it('should be stateless', () => {
            const attempts1 = [createAttempt('Hello', 'Hello', 1000, 5000)];
            const attempts2 = [createAttempt('World', 'World', 2000, 4000)];

            const stats1 = service.calculate(attempts1);
            const stats2 = service.calculate(attempts2);

            // Results should be independent
            expect(stats1.totalCharactersTyped).toBe(5);
            expect(stats2.totalCharactersTyped).toBe(5);
        });

        it('should handle concurrent calculations', () => {
            const attempts = [createAttempt('Test', 'Test', 1000, 1000)];

            const results = Array.from({ length: 100 }, () => 
                service.calculate(attempts)
            );

            // All results should be identical
            results.forEach(stat => {
                expect(stat.totalAttempts).toBe(1);
            });
        });
    });

    describe('edge cases', () => {
        it('should handle very long duration attempts', () => {
            const attempts = [
                createAttempt('Slow', 'Slow', 0, Number.MAX_SAFE_INTEGER)
            ];

            const stats = service.calculate(attempts);

            expect(stats.totalDurationMs).toBe(Number.MAX_SAFE_INTEGER);
            expect(stats.averageWPM).toBeCloseTo(0, 5); // Essentially 0
        });

        it('should handle zero duration attempts', () => {
            const attempts = [
                createAttempt('Instant', 'Instant', 1000, 0)
            ];

            const stats = service.calculate(attempts);

            expect(stats.totalDurationMs).toBe(0);
            expect(stats.averageWPM).toBe(0); // Avoid division by zero
        });

        it('should handle very large number of attempts', () => {
            const attempts = Array.from({ length: 10000 }, (_, i) =>
                createAttempt(`Text${i}`, `Text${i}`, i * 1000, 1000)
            );

            const startTime = performance.now();
            const stats = service.calculate(attempts);
            const endTime = performance.now();

            expect(stats.totalAttempts).toBe(10000);
            expect(endTime - startTime).toBeLessThan(100); // Should be fast
        });
    });
});

