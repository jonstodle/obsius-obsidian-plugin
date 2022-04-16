import { Notice, Plugin, TFile } from 'obsidian';
import type { ObsiusClient } from './src/obsius';
import { createClient } from './src/obsius';
import { getText } from './src/text';
import { ShowUrlModal } from './src/modals';

export default class ObsiusPlugin extends Plugin {
	obsiusClient: ObsiusClient;

	async onload() {
		this.obsiusClient = await createClient(
			async () => ({
				posts: {},
				...(await this.loadData()),
			}),
			async (data) => await this.saveData(data)
		);

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile) {
					menu
						.addSeparator()
						.addItem(item => item
							.setTitle(getText('actions.publish.name'))
							.setIcon('double-up-arrow-glyph')
							.onClick(async () => {
								try {
									const url = await this.obsiusClient.publishPost(file);
									new ShowUrlModal(this.app, url).open();
								} catch (e) {
									console.error(e);
									new Notice(getText('actions.publish.failure'));
								}
							}))
						.addItem(item => item
							.setTitle(getText('actions.showUrl.name'))
							.setIcon('link')
							.onClick(() => {
								const url = this.obsiusClient.getUrl(file);
								if (url) {
									new ShowUrlModal(this.app, url).open();
								} else {
									new Notice(getText('actions.showUrl.failure'));
								}
							}))
						.addItem(item => item
							.setTitle(getText('actions.remove.name'))
							.setIcon('cross')
							.onClick(async () => {
								try {
									await this.obsiusClient.deletePost(file);
									new Notice(getText('actions.remove.success'));
								} catch (e) {
									console.error(e);
									new Notice(getText('actions.remove.failure'));
								}
							}))
						.addSeparator();
				}
			})
		);
	}

	onunload() {
	}
}
