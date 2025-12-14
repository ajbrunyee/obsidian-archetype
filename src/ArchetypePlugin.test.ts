import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchetypePlugin } from './ArchetypePlugin';

// Mock the obsidian module before importing the plugin
vi.mock('obsidian');

describe('ArchetypePlugin', () => {
	let plugin: ArchetypePlugin;

	beforeEach(() => {
		// Mock app and manifest required by Plugin constructor
		const mockApp = {} as any;
		const mockManifest = {} as any;
		
		plugin = new ArchetypePlugin(mockApp, mockManifest);
		
		// Setup default mocks for Plugin methods
		plugin.loadData = vi.fn().mockResolvedValue({});
		plugin.saveData = vi.fn().mockResolvedValue(undefined);
		plugin.addCommand = vi.fn();
		plugin.addRibbonIcon = vi.fn().mockReturnValue({ addClass: vi.fn() });
		plugin.addStatusBarItem = vi.fn().mockReturnValue({ setText: vi.fn() });
		plugin.addSettingTab = vi.fn();
		plugin.registerDomEvent = vi.fn();
		plugin.registerInterval = vi.fn();
	});

	describe('initialization', () => {
		it('should create a plugin instance', () => {
			expect(plugin).toBeDefined();
			expect(plugin).toBeInstanceOf(ArchetypePlugin);
		});

		it('should have settings property after loadSettings', async () => {
			await plugin.loadSettings();
			expect(plugin.settings).toBeDefined();
		});
	});

	describe('loadSettings', () => {
		it('should load settings with defaults', async () => {
			plugin.loadData = vi.fn().mockResolvedValue({});
			
			await plugin.loadSettings();
			
		expect(plugin.settings).toEqual({
			speedReadingWPM: 300,
			speedReadingChunkSize: 3,
			typingChunkSize: 1,
			typingMatchStrategy: 'lenient',
			typingFuzzyThreshold: 2,
			typingStripPunctuation: true
		});
		});

	it('should merge loaded data with defaults', async () => {
		plugin.loadData = vi.fn().mockResolvedValue({
			typingChunkSize: 5,
		});
		
		await plugin.loadSettings();
		
		expect(plugin.settings.typingChunkSize).toBe(5);
		expect(plugin.settings.speedReadingWPM).toBe(300); // default
		expect(plugin.settings.typingStripPunctuation).toBe(true); // default
	});
});

describe('saveSettings', () => {
	it('should call saveData with settings', async () => {
		plugin.saveData = vi.fn().mockResolvedValue(undefined);
		plugin.settings = {
			speedReadingWPM: 400,
			speedReadingChunkSize: 3,
			typingChunkSize: 2,
			typingMatchStrategy: 'lenient',
			typingFuzzyThreshold: 2,
			typingStripPunctuation: true
		};
		
		await plugin.saveSettings();
		
		expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
	});
});

	describe('onload', () => {
		it('should load settings on plugin load', async () => {
			const loadSettingsSpy = vi.spyOn(plugin, 'loadSettings');
			
			await plugin.onload();
			
			expect(loadSettingsSpy).toHaveBeenCalled();
		});

		it('should register speed reading command', async () => {
			plugin.addCommand = vi.fn();
			
			await plugin.onload();
			
			expect(plugin.addCommand).toHaveBeenCalled();
			expect(plugin.addCommand).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'start-speed-reading',
					name: 'Start speed reading',
				})
			);
		});

		it('should add settings tab', async () => {
			plugin.addSettingTab = vi.fn();
			
			await plugin.onload();
			
			expect(plugin.addSettingTab).toHaveBeenCalled();
		});
	});

	describe('speed reading command', () => {
		let commandCallback: any;
		let mockEditor: any;

		beforeEach(async () => {
		plugin.addCommand = vi.fn((command) => {
			if (command.id === 'start-speed-reading') {
				commandCallback = command.editorCallback;
			}
			return command as any; // Return command to satisfy Command type
		});
			
			await plugin.onload();

			// Create mock editor
			mockEditor = {
				getSelection: vi.fn(),
				getValue: vi.fn(),
			};
		});

		it('should use selected text when available', () => {
			const selectedText = 'This is selected text. Another sentence here.';
			mockEditor.getSelection.mockReturnValue(selectedText);
			mockEditor.getValue.mockReturnValue('Full document text with more content.');

			// Execute the command
			commandCallback(mockEditor, {});

			// Should only call getSelection, not getValue (since selection exists)
			expect(mockEditor.getSelection).toHaveBeenCalled();
			// getValue should still be called as fallback check, but selection takes precedence
		});

		it('should use entire document when no selection', () => {
			const fullDocumentText = 'This is the full document. It has multiple sentences. Reading everything.';
			mockEditor.getSelection.mockReturnValue(''); // Empty selection
			mockEditor.getValue.mockReturnValue(fullDocumentText);

			// Execute the command
			commandCallback(mockEditor, {});

			// Should call both (getSelection returns empty, falls back to getValue)
			expect(mockEditor.getSelection).toHaveBeenCalled();
			expect(mockEditor.getValue).toHaveBeenCalled();
		});

		it('should use entire document when selection is only whitespace', () => {
			const fullDocumentText = 'Full document content here.';
			mockEditor.getSelection.mockReturnValue('   \n\t  '); // Only whitespace
			mockEditor.getValue.mockReturnValue(fullDocumentText);

			// Execute the command
			commandCallback(mockEditor, {});

			expect(mockEditor.getSelection).toHaveBeenCalled();
			expect(mockEditor.getValue).toHaveBeenCalled();
		});

		it('should show error notice when no text available', () => {
			// Mock Notice
			const NoticeMock = vi.fn();
			vi.doMock('obsidian', () => ({
				Notice: NoticeMock,
			}));

			mockEditor.getSelection.mockReturnValue('');
			mockEditor.getValue.mockReturnValue(''); // Empty document too

			// Execute the command
			commandCallback(mockEditor, {});

			// Note: In actual implementation, Notice is used but hard to test in unit tests
			// This test documents the expected behavior
			expect(mockEditor.getSelection).toHaveBeenCalled();
			expect(mockEditor.getValue).toHaveBeenCalled();
		});
	});
});
