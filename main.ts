import { Notice, Plugin, TFile } from 'obsidian';
import type { ObsiusClient } from './src/obsius';
import { createClient } from './src/obsius';
import { getText } from './src/text';

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
					menu.addSeparator();
					if (!this.obsiusClient.getUrl(file)) {
						menu
							.addItem(item => item
								.setTitle(getText('actions.create.name'))
								.setIcon('up-chevron-glyph')
								.onClick(async () => {
									try {
										const url = await this.obsiusClient.createPost(file);
										await navigator.clipboard.writeText(url);
										new Notice(getText('actions.create.success'));
									} catch (e) {
										console.error(e);
										new Notice(getText('actions.create.failure'));
									}
								}));
					} else {
						menu
							.addItem(item => item
								.setTitle(getText('actions.update.name'))
								.setIcon('double-up-arrow-glyph')
								.onClick(async () => {
									try {
										await this.obsiusClient.updatePost(file);
										new Notice(getText('actions.update.success'));
									} catch (e) {
										console.error(e);
										new Notice(getText('actions.update.failure'));
									}
								}))
							.addItem(item => item
								.setTitle(getText('actions.copyUrl.name'))
								.setIcon('link')
								.onClick(async () => {
									const url = this.obsiusClient.getUrl(file);
									if (url) {
										await navigator.clipboard.writeText(url);
										new Notice(getText('actions.copyUrl.success'));
									} else {
										new Notice(getText('actions.copyUrl.failure'));
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
								}));
					}
					menu.addSeparator();
				}
			})
		);
	}

	onunload() {
	}
}
