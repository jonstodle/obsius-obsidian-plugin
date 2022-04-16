import { App, Modal, Setting } from 'obsidian';
import { getText } from './text';

export class ShowUrlModal extends Modal {
	constructor(app: App, private url: string) {
		super(app);
	}

	onOpen() {
		this.contentEl.createEl('h1', {text: getText('modals.showUrl.title')});
		this.contentEl.createEl('code', {text: this.url});

		new Setting(this.contentEl)
			.addButton(button => button
				.setButtonText(getText('modals.showUrl.copy'))
				.onClick(async () => {
					await navigator.clipboard.writeText(this.url);
					this.close();
				})
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}
