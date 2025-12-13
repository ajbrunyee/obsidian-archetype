/**
 * ProgressionState - Enum
 * 
 * Defines the possible states of chunk progression during a reading session.
 */
export enum ProgressionState {
	/** Not yet started, awaiting user action */
	IDLE = 'IDLE',
	
	/** Actively displaying chunks in sequence */
	PLAYING = 'PLAYING',
	
	/** Temporarily stopped, can resume from current position */
	PAUSED = 'PAUSED',
	
	/** Reached the end of the sequence */
	COMPLETED = 'COMPLETED',
}

