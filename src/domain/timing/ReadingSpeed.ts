/**
 * ReadingSpeed - Value Object
 * 
 * Represents a reading pace measured in Words Per Minute (WPM).
 * Immutable value object used to calculate chunk display durations.
 */
export class ReadingSpeed {
	private readonly _wpm: number;

	private constructor(wpm: number) {
		if (wpm <= 0) {
			throw new Error('Reading speed must be positive');
		}
		this._wpm = wpm;
	}

	/**
	 * Create a ReadingSpeed from WPM value
	 */
	static fromWPM(wpm: number): ReadingSpeed {
		return new ReadingSpeed(wpm);
	}

	/**
	 * Get the WPM value
	 */
	get wpm(): number {
		return this._wpm;
	}

	/**
	 * Predefined reading speeds
	 */
	static readonly SLOW = ReadingSpeed.fromWPM(200);
	static readonly NORMAL = ReadingSpeed.fromWPM(300);
	static readonly FAST = ReadingSpeed.fromWPM(450);

	/**
	 * Check equality with another ReadingSpeed
	 */
	equals(other: ReadingSpeed): boolean {
		return this._wpm === other._wpm;
	}
}

