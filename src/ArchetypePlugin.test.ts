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
				mySetting: 'default',
			});
		});

		it('should merge loaded data with defaults', async () => {
			plugin.loadData = vi.fn().mockResolvedValue({
				mySetting: 'custom value',
			});
			
			await plugin.loadSettings();
			
			expect(plugin.settings.mySetting).toBe('custom value');
		});
	});

	describe('saveSettings', () => {
		it('should call saveData with settings', async () => {
			plugin.saveData = vi.fn().mockResolvedValue(undefined);
			plugin.settings = { mySetting: 'test' };
			
			await plugin.saveSettings();
			
			expect(plugin.saveData).toHaveBeenCalledWith({ mySetting: 'test' });
		});
	});

	describe('onload', () => {
		it('should load settings on plugin load', async () => {
			const loadSettingsSpy = vi.spyOn(plugin, 'loadSettings');
			
			await plugin.onload();
			
			expect(loadSettingsSpy).toHaveBeenCalled();
		});

		it('should register commands', async () => {
			plugin.addCommand = vi.fn();
			
			await plugin.onload();
			
			expect(plugin.addCommand).toHaveBeenCalled();
			expect(plugin.addCommand).toHaveBeenCalledTimes(3);
		});

		it('should add ribbon icon', async () => {
			plugin.addRibbonIcon = vi.fn().mockReturnValue({
				addClass: vi.fn(),
			});
			
			await plugin.onload();
			
			expect(plugin.addRibbonIcon).toHaveBeenCalledWith(
				'dice',
				'Sample Plugin',
				expect.any(Function)
			);
		});

		it('should add settings tab', async () => {
			plugin.addSettingTab = vi.fn();
			
			await plugin.onload();
			
			expect(plugin.addSettingTab).toHaveBeenCalled();
		});
	});
});
