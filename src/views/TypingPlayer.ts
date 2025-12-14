import { App } from 'obsidian';
import { TypingSession } from '../domain/typing/TypingSession';
import { TypingSessionState } from '../domain/typing/TypingSessionState';
import { TypingMatch } from '../domain/typing/TypingMatch';

/**
 * TypingPlayer - View Component
 * 
 * Manages the full-screen overlay for touch typing practice.
 * Displays target text and captures user input for comparison.
 */
export class TypingPlayer {
	private app: App;
	private session: TypingSession;
	private overlayEl: HTMLElement | null = null;
	private displayEl: HTMLElement | null = null;
	private inputEl: HTMLInputElement | null = null;
	private feedbackEl: HTMLElement | null = null;
	private progressEl: HTMLElement | null = null;
	private statsEl: HTMLElement | null = null;
	private attemptLog: Array<{
		chunkIndex: number;
		input: string;
		target: string;
		isMatch: boolean;
		strategyName: string;
		timestamp: number;
	}> = [];

	constructor(app: App, session: TypingSession) {
		this.app = app;
		this.session = session;
		
		// Log session start
		console.log('🎯 Touch Typing Session Started', {
			totalChunks: session.totalChunks,
			startTime: new Date().toISOString()
		});
	}

	/**
	 * Show the overlay and start typing session
	 */
	show(): void {
		this.createOverlay();
		this.start();
	}

	/**
	 * Hide the overlay and cleanup
	 */
	hide(): void {
		// Log session end
		console.log('🛑 Touch Typing Session Ended', {
			totalAttempts: this.attemptLog.length,
			completed: this.session.isComplete,
			duration: (this.session.sessionDuration / 1000).toFixed(1) + 's'
		});
		
		this.removeOverlay();
	}

	/**
	 * Get the attempt log for debugging
	 */
	getAttemptLog() {
		return this.attemptLog;
	}

	/**
	 * Create and append the overlay to document.body
	 */
	private createOverlay(): void {
		// Create overlay container
		this.overlayEl = document.createElement('div');
		this.overlayEl.addClass('archetype-typing-overlay');

		// Create container for typing UI
		const container = document.createElement('div');
		container.addClass('archetype-typing-container');

		// Progress bar
		this.progressEl = document.createElement('div');
		this.progressEl.addClass('archetype-typing-progress');
		container.appendChild(this.progressEl);

		// Target text display
		this.displayEl = document.createElement('div');
		this.displayEl.addClass('archetype-typing-display');
		container.appendChild(this.displayEl);

		// Input field
		this.inputEl = document.createElement('input');
		this.inputEl.addClass('archetype-typing-input');
		this.inputEl.type = 'text';
		this.inputEl.placeholder = 'Type here...';
		this.inputEl.autocomplete = 'off';
		this.inputEl.spellcheck = false;
		this.inputEl.setAttribute('autocorrect', 'off');
		this.inputEl.setAttribute('autocapitalize', 'off');
		container.appendChild(this.inputEl);

		// Feedback display
		this.feedbackEl = document.createElement('div');
		this.feedbackEl.addClass('archetype-typing-feedback');
		container.appendChild(this.feedbackEl);

		// Stats display
		this.statsEl = document.createElement('div');
		this.statsEl.addClass('archetype-typing-stats');
		container.appendChild(this.statsEl);

		// Help text
		const helpEl = document.createElement('div');
		helpEl.addClass('archetype-typing-help');
		helpEl.textContent = 'Press Escape to exit';
		container.appendChild(helpEl);

		// Event handlers
		this.inputEl.addEventListener('keydown', (e) => this.handleKeyDown(e));
		this.inputEl.addEventListener('input', () => this.handleInput());

		// Assemble
		this.overlayEl.appendChild(container);
		document.body.appendChild(this.overlayEl);

		// Initial display
		this.updateDisplay();
		this.updateProgress();
		this.updateStats();

		// Focus input
		this.inputEl.focus();
	}

	/**
	 * Remove overlay from DOM
	 */
	private removeOverlay(): void {
		if (this.overlayEl) {
			this.overlayEl.remove();
			this.overlayEl = null;
			this.displayEl = null;
			this.inputEl = null;
			this.feedbackEl = null;
			this.progressEl = null;
			this.statsEl = null;
		}
	}

	/**
	 * Start typing session
	 */
	private start(): void {
		if (this.session.state !== TypingSessionState.IDLE) {
			return;
		}

		this.session.start();
		this.updateDisplay();
	}

	/**
	 * Handle keyboard input
	 */
	private handleKeyDown(e: KeyboardEvent): void {
		if (e.key === 'Escape') {
			e.preventDefault();
			this.hide();
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			this.submitInput();
		}
	}

	/**
	 * Handle input field changes (for real-time feedback)
	 */
	private handleInput(): void {
		// Clear feedback on new input
		if (this.feedbackEl) {
			this.feedbackEl.textContent = '';
			this.feedbackEl.className = 'archetype-typing-feedback';
		}
	}

	/**
	 * Submit current input for comparison
	 */
	private submitInput(): void {
		if (!this.inputEl || this.session.state !== TypingSessionState.AWAITING_INPUT) {
			return;
		}

		const input = this.inputEl.value;
		const currentChunk = this.session.currentChunk;
		const target = currentChunk?.content || '';
		
		console.log('📝 Typing Attempt:', {
			chunkIndex: this.session.currentIndex,
			input: JSON.stringify(input),
			target: JSON.stringify(target),
			inputLength: input.length,
			targetLength: target.length,
			inputBytes: new TextEncoder().encode(input),
			targetBytes: new TextEncoder().encode(target)
		});
		
		try {
			const match = this.session.submitInput(input);
			
			// Log the attempt
			const logEntry = {
				chunkIndex: this.session.currentIndex - (match.isMatch ? 1 : 0), // Adjust if advanced
				input: input,
				target: target,
				isMatch: match.isMatch,
				strategyName: match.strategyName,
				timestamp: Date.now()
			};
			this.attemptLog.push(logEntry);
			
			// Detailed console log
			console.log(match.isMatch ? '✅ Match Success' : '❌ Match Failed', {
				input: JSON.stringify(input),
				target: JSON.stringify(target),
				strategyUsed: match.strategyName,
				inputTrimmed: JSON.stringify(input.trim()),
				targetTrimmed: JSON.stringify(target.trim()),
				inputLowerCase: JSON.stringify(input.toLowerCase()),
				targetLowerCase: JSON.stringify(target.toLowerCase()),
				areEqual: input === target,
				areTrimmedEqual: input.trim() === target.trim(),
				areLowerCaseEqual: input.toLowerCase() === target.toLowerCase(),
				areTrimmedLowerCaseEqual: input.trim().toLowerCase() === target.trim().toLowerCase()
			});
			
			this.handleMatchResult(match);

			// Clear input
			this.inputEl.value = '';

			// Update displays
			this.updateDisplay();
			this.updateProgress();
			this.updateStats();

			// Check if completed
			if (this.session.isComplete) {
				this.showCompletionScreen();
			}
		} catch (error) {
			console.error('❌ Typing Error:', error);
			this.showError(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	/**
	 * Handle match result and show feedback
	 */
	private handleMatchResult(match: TypingMatch): void {
		if (!this.feedbackEl) return;

		if (match.isMatch) {
			this.feedbackEl.textContent = '✓ Correct!';
			this.feedbackEl.addClass('archetype-typing-feedback-success');
		} else {
			this.feedbackEl.textContent = '✗ Try again';
			this.feedbackEl.addClass('archetype-typing-feedback-error');
			
			// Refocus input
			this.inputEl?.focus();
		}
	}

	/**
	 * Show error message
	 */
	private showError(message: string): void {
		if (!this.feedbackEl) return;

		this.feedbackEl.textContent = `Error: ${message}`;
		this.feedbackEl.addClass('archetype-typing-feedback-error');
	}

	/**
	 * Update the display with current target text
	 */
	private updateDisplay(): void {
		if (!this.displayEl) return;

		const currentChunk = this.session.currentChunk;
		if (currentChunk) {
			this.displayEl.textContent = currentChunk.content;
		} else {
			this.displayEl.textContent = '';
		}
	}

	/**
	 * Update progress bar
	 */
	private updateProgress(): void {
		if (!this.progressEl) return;

		const progress = this.session.getProgress();
		const attemptsForChunk = this.session.getAttemptsForCurrentChunk();

		let progressText = `Progress: ${this.session.currentIndex}/${this.session.totalChunks} (${progress}%)`;
		
		if (attemptsForChunk > 0) {
			progressText += ` • Attempts: ${attemptsForChunk}`;
		}

		this.progressEl.textContent = progressText;
	}

	/**
	 * Update statistics display
	 */
	private updateStats(): void {
		if (!this.statsEl) return;

		const stats = this.session.getStatistics();
		
		if (stats.totalAttempts === 0) {
			this.statsEl.textContent = '';
			return;
		}

		const accuracy = stats.accuracyRate.toFixed(1);
		const wpm = stats.averageWPM.toFixed(0);
		const cpm = stats.averageCPM.toFixed(0);

		this.statsEl.textContent = `Accuracy: ${accuracy}% • WPM: ${wpm} • CPM: ${cpm}`;
	}

	/**
	 * Show completion screen with final statistics
	 */
	private showCompletionScreen(): void {
		if (!this.displayEl || !this.inputEl || !this.feedbackEl) return;

		const stats = this.session.getStatistics();

		// Log session completion with full attempt log
		console.log('🎉 Session Complete!', {
			stats: {
				accuracy: stats.accuracyRate.toFixed(1) + '%',
				wpm: stats.averageWPM.toFixed(0),
				cpm: stats.averageCPM.toFixed(0),
				totalAttempts: stats.totalAttempts,
				errors: stats.totalErrors,
				duration: (this.session.sessionDuration / 1000).toFixed(1) + 's'
			},
			attemptLog: this.attemptLog
		});
		
		// Also log a detailed breakdown of failures
		const failures = this.attemptLog.filter(a => !a.isMatch);
		if (failures.length > 0) {
			console.log('❌ Failed Attempts Breakdown:', failures.map(f => ({
				chunkIndex: f.chunkIndex,
				input: JSON.stringify(f.input),
				target: JSON.stringify(f.target),
				timestamp: new Date(f.timestamp).toISOString()
			})));
		}

		// Hide input
		this.inputEl.style.display = 'none';

		// Show completion message
		this.displayEl.innerHTML = `
			<div class="archetype-typing-completion">
				<h2>🎉 Session Complete!</h2>
				<div class="archetype-typing-final-stats">
					<div class="stat-item">
						<div class="stat-label">Accuracy</div>
						<div class="stat-value">${stats.accuracyRate.toFixed(1)}%</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Words per Minute</div>
						<div class="stat-value">${stats.averageWPM.toFixed(0)}</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Characters per Minute</div>
						<div class="stat-value">${stats.averageCPM.toFixed(0)}</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Total Attempts</div>
						<div class="stat-value">${stats.totalAttempts}</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Errors</div>
						<div class="stat-value">${stats.totalErrors}</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Duration</div>
						<div class="stat-value">${(this.session.sessionDuration / 1000).toFixed(1)}s</div>
					</div>
				</div>
				<p class="archetype-typing-completion-message">Click anywhere or press Escape to close</p>
				<p class="archetype-typing-completion-hint" style="font-size: 12px; color: var(--text-faint); margin-top: 1rem;">
					Check the console (Cmd+Opt+I / Ctrl+Shift+I) for detailed attempt logs
				</p>
			</div>
		`;

		// Clear feedback
		this.feedbackEl.textContent = '';

		// Add click-to-close
		this.overlayEl?.addEventListener('click', () => this.hide());
	}
}

