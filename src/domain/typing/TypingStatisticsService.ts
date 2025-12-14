import { TypingAttempt } from './TypingAttempt';
import { TypingStatistics } from './TypingStatistics';

/**
 * Domain service for calculating typing session statistics.
 * Aggregates metrics from a collection of typing attempts.
 */
export class TypingStatisticsService {
    /**
     * Calculates comprehensive statistics from typing attempts.
     * 
     * @param attempts - Array of typing attempts to analyze
     * @returns TypingStatistics containing aggregated metrics
     */
    calculate(attempts: TypingAttempt[]): TypingStatistics {
        return new TypingStatistics(attempts);
    }

    /**
     * Filters attempts by success/failure and calculates statistics for each group.
     * Useful for understanding performance patterns.
     * 
     * @param attempts - Array of typing attempts
     * @returns Object containing stats for successful and failed attempts
     */
    calculateByResult(attempts: TypingAttempt[]): {
        successful: TypingStatistics;
        failed: TypingStatistics;
        overall: TypingStatistics;
    } {
        const successful = attempts.filter(a => a.match.isMatch);
        const failed = attempts.filter(a => !a.match.isMatch);

        return {
            successful: new TypingStatistics(successful),
            failed: new TypingStatistics(failed),
            overall: new TypingStatistics(attempts)
        };
    }

    /**
     * Calculates rolling statistics over a time window.
     * Useful for tracking improvement over time.
     * 
     * @param attempts - Array of typing attempts (should be chronologically ordered)
     * @param windowSizeMs - Size of rolling window in milliseconds
     * @returns Array of statistics snapshots at different time points
     */
    calculateRolling(attempts: TypingAttempt[], windowSizeMs: number): TypingStatistics[] {
        if (attempts.length === 0) {
            return [];
        }

        // Sort attempts by timestamp (defensive)
        const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
        const results: TypingStatistics[] = [];

        // Find the earliest and latest timestamps
        const startTime = sorted[0].timestamp;
        const endTime = sorted[sorted.length - 1].timestamp;

        // If all attempts fit in one window, return single stat
        if (endTime - startTime <= windowSizeMs) {
            return [new TypingStatistics(sorted)];
        }

        // Create windows from start to end
        for (let windowStart = startTime; windowStart <= endTime; windowStart += windowSizeMs) {
            const windowEnd = windowStart + windowSizeMs;
            const windowAttempts = sorted.filter(
                a => a.timestamp >= windowStart && a.timestamp < windowEnd
            );

            if (windowAttempts.length > 0) {
                results.push(new TypingStatistics(windowAttempts));
            }
        }

        return results;
    }

    /**
     * Compares two sets of attempts to see if there's improvement.
     * 
     * @param earlierAttempts - Earlier typing attempts
     * @param laterAttempts - Later typing attempts
     * @returns Object showing improvement metrics (positive = improvement)
     */
    compareProgress(
        earlierAttempts: TypingAttempt[],
        laterAttempts: TypingAttempt[]
    ): {
        accuracyDelta: number;      // Percentage points change in accuracy
        wpmDelta: number;            // Change in WPM
        cpmDelta: number;            // Change in CPM
        errorRateDelta: number;      // Change in error rate
    } {
        const earlier = new TypingStatistics(earlierAttempts);
        const later = new TypingStatistics(laterAttempts);

        return {
            accuracyDelta: later.accuracyRate - earlier.accuracyRate,
            wpmDelta: later.averageWPM - earlier.averageWPM,
            cpmDelta: later.averageCPM - earlier.averageCPM,
            errorRateDelta: (later.totalErrors / (later.totalAttempts || 1)) - 
                           (earlier.totalErrors / (earlier.totalAttempts || 1))
        };
    }

    /**
     * Identifies attempts that are outliers (unusually slow or fast).
     * Useful for detecting problematic chunks or data anomalies.
     * 
     * @param attempts - Array of typing attempts
     * @param standardDeviations - Number of standard deviations to consider outlier (default: 2)
     * @returns Object containing slow and fast outlier attempts
     */
    findOutliers(
        attempts: TypingAttempt[],
        standardDeviations: number = 2
    ): {
        slowOutliers: TypingAttempt[];
        fastOutliers: TypingAttempt[];
    } {
        if (attempts.length < 3) {
            // Not enough data for meaningful outlier detection
            return { slowOutliers: [], fastOutliers: [] };
        }

        // Calculate mean and standard deviation of durations
        const durations = attempts.map(a => a.duration);
        const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
        const stdDev = Math.sqrt(variance);

        const threshold = standardDeviations * stdDev;

        const slowOutliers = attempts.filter(a => a.duration > mean + threshold);
        const fastOutliers = attempts.filter(a => a.duration < mean - threshold);

        return { slowOutliers, fastOutliers };
    }

    /**
     * Calculates statistics for a specific time range.
     * 
     * @param attempts - Array of typing attempts
     * @param startTime - Start of time range (Unix timestamp in ms)
     * @param endTime - End of time range (Unix timestamp in ms)
     * @returns TypingStatistics for attempts within the time range
     */
    calculateForTimeRange(
        attempts: TypingAttempt[],
        startTime: number,
        endTime: number
    ): TypingStatistics {
        const filtered = attempts.filter(
            a => a.timestamp >= startTime && a.timestamp <= endTime
        );
        return new TypingStatistics(filtered);
    }
}

