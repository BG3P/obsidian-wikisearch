import { get } from 'http';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, requestUrl } from 'obsidian';

// Remember to rename these classes and interfaces!

interface WikiSearchPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: WikiSearchPluginSettings = {
	mySetting: 'default'
}

export default class WikiSearchPlugin extends Plugin {
	settings: WikiSearchPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'wikisearch-search',
			name: 'Search',
			callback: () => {
				new WikiSearchSuggestModal(this.app).open();
			}
		});		
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

import { SuggestModal, TFile } from 'obsidian';

class WikiSearchSuggestModal extends SuggestModal<SearchEntry> {
  constructor(app: App) {
    super(app);
  }

onOpen() {
	super.onOpen();
}

async getSuggestions(query: string): Promise<SearchEntry[]> {

	if (query.length != 0)
	{
		const url = `https://forgottenrealms.fandom.com/api.php?action=opensearch&search=${query}&limit=20`;
		try {

			var response = await requestUrl(url);
			console.log(response);
			const data = await response.json;
			const searchEntries: SearchEntry[] = data[1].map((title: string, index: number) => {
				return {
					title,
					link: data[3][index]
				};
			});
			return searchEntries;
		} catch (error) {
			console.error('Error fetching suggestions:', error);
			return [];
		}
	}
	return[];
}

onChooseSuggestion(item: SearchEntry, evt: MouseEvent | KeyboardEvent): any {
	const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	if (editor) {
		const cursor = editor.getCursor();
		const linkText = `[${item.title}](${item.link}) `;
		editor.replaceRange(linkText, cursor);
		editor.setCursor(cursor.line, cursor.ch + linkText.length);
		
	}
}

  renderSuggestion(entry: SearchEntry, el: HTMLElement) {
    el.createEl('div', { text: entry.title });
  }
  
}

class SearchEntry {
	title: string;
	link: string;
}