import { ChunkSequence } from '../chunking/ChunkSequence';
import { ChunkTiming } from './ChunkTiming';

/**
 * TimingService - Domain Service
 * 
 * Calculates timing information for chunk sequences.
 */
export class TimingService {
	/**
	 * Calculate total display duration for an entire sequence
	 * Returns the sum of all chunk durations in milliseconds
	 */
	static calculateSequenceDuration(
		sequence: ChunkSequence,
		timing: ChunkTiming
	): number {
		if (sequence.isEmpty) {
			return 0;
		}

		let totalDuration = 0;
		for (const chunk of sequence.chunks) {
			totalDuration += timing.calculateDuration(chunk);
		}

		return totalDuration;
	}
}

