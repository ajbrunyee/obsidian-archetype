import { vi } from 'vitest';

/**
 * Mock Obsidian Plugin class for testing
 */
export class Plugin {
	app: any;
	manifest: any;
	
	constructor() {
		this.app = createMockApp();
		this.manifest = {
			id: 'test-plugin',
			name: 'Test Plugin',
			version: '1.0.0',
		};
	}

	addCommand = vi.fn();
	addRibbonIcon = vi.fn(() => createMockHTMLElement());
	addStatusBarItem = vi.fn(() => createMockHTMLElement());
	addSettingTab = vi.fn();
	registerDomEvent = vi.fn();
	registerInterval = vi.fn();
	loadData = vi.fn().mockResolvedValue({});
	saveData = vi.fn().mockResolvedValue(undefined);
}

/**
 * Mock Obsidian App
 */
export function createMockApp() {
	return {
		workspace: {
			getActiveViewOfType: vi.fn(),
		},
		vault: {
			read: vi.fn(),
			modify: vi.fn(),
		},
	};
}

/**
 * Mock HTML Element
 */
export function createMockHTMLElement() {
	return {
		addClass: vi.fn(),
		removeClass: vi.fn(),
		setText: vi.fn(),
		empty: vi.fn(),
		createEl: vi.fn(),
	};
}

/**
 * Mock Modal
 */
export class Modal {
	app: any;
	contentEl: any;
	modalEl: any;

	constructor(app: any) {
		this.app = app;
		this.contentEl = createMockHTMLElement();
		this.modalEl = {
			style: {},
			...createMockHTMLElement(),
		};
	}

	open = vi.fn();
	close = vi.fn();
}

/**
 * Mock PluginSettingTab
 */
export class PluginSettingTab {
	app: any;
	plugin: any;
	containerEl: any;

	constructor(app: any, plugin: any) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = createMockHTMLElement();
	}

	display = vi.fn();
	hide = vi.fn();
}

/**
 * Mock Notice
 */
export class Notice {
	constructor(public message: string) {}
	setMessage = vi.fn();
	hide = vi.fn();
}

/**
 * Mock Setting
 */
export class Setting {
	constructor(public containerEl: any) {}
	setName = vi.fn().mockReturnThis();
	setDesc = vi.fn().mockReturnThis();
	addText = vi.fn((callback: any) => {
		callback({
			setPlaceholder: vi.fn().mockReturnThis(),
			setValue: vi.fn().mockReturnThis(),
			onChange: vi.fn().mockReturnThis(),
		});
		return this;
	});
}

/**
 * Mock Editor
 */
export class Editor {
	getSelection = vi.fn();
	replaceSelection = vi.fn();
	getValue = vi.fn();
	setValue = vi.fn();
}

/**
 * Mock MarkdownView
 */
export class MarkdownView {
	editor: Editor;
	constructor() {
		this.editor = new Editor();
	}
	getMode = vi.fn();
}

/**
 * Mock App type
 */
export type App = ReturnType<typeof createMockApp>;
