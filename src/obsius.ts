import http from "./http";
import { TFile } from "obsidian";

const baseUrl = "https://obsius.site";

interface CreateResponse {
	id: string;
	secret: string;
}

const obsiusWrapper = {
	async createPost(title: string, content: string): Promise<CreateResponse> {
		return http("POST", `${baseUrl}/`, { title, content });
	},
	async updatePost(
		id: string,
		secret: string,
		title: string,
		content: string
	): Promise<void> {
		return http("PUT", `${baseUrl}/${id}`, {
			secret,
			title,
			content,
		});
	},
	async deletePost(id: string, secret: string): Promise<void> {
		return http("DELETE", `${baseUrl}/${id}`, { secret });
	},
};

export interface Post {
	id: string;
	secret: string;
}

export interface Data {
	posts: Record<string, Post>;
}

export interface ObsiusClient {
	data(): Data;

	publishPost(file: TFile): Promise<string | null>;

	createPost(view: TFile): Promise<string>;

	getUrl(view: TFile): string | null;

	updatePost(view: TFile): Promise<void>;

	deletePost(view: TFile): Promise<void>;

	handleNoteRename(file: TFile, oldPath: string): Promise<void>;

	handleNoteDelete(file: TFile): Promise<void>;
}

export async function createClient(
	loadData: () => Promise<Data>,
	saveData: (data: Data) => Promise<void>
): Promise<ObsiusClient> {
	const data = await loadData();

	return {
		data() {
			return data;
		},
		async publishPost(file: TFile) {
			if (data.posts[file.path]) {
				await this.updatePost(file);
				return null;
			} else {
				return await this.createPost(file);
			}
		},
		async createPost(file: TFile) {
			const title = file.basename;
			const content = await file.vault.read(file);

			try {
				const resp = await obsiusWrapper.createPost(title, content);
				data.posts[file.path] = {
					id: resp.id,
					secret: resp.secret,
				};
				await saveData(data);

				return `${baseUrl}/${resp.id}`;
			} catch (e) {
				console.error(e);
				throw new Error("Failed to create post");
			}
		},
		getUrl(file: TFile): string | null {
			const post = data.posts[file.path];
			if (!post) {
				return null;
			}

			return `${baseUrl}/${post.id}`;
		},
		async updatePost(file: TFile) {
			const post = data.posts[file.path];
			const title = file.basename;
			const content = await file.vault.read(file);

			try {
				await obsiusWrapper.updatePost(
					post.id,
					post.secret,
					title,
					content
				);
			} catch (e) {
				console.error(e);
				throw new Error("Failed to update post");
			}
		},
		async deletePost(file: TFile) {
			const post = data.posts[file.path];

			try {
				await obsiusWrapper.deletePost(post.id, post.secret);
				delete data.posts[file.path];
				await saveData(data);
			} catch (e) {
				console.error(e);
				throw new Error("Failed to delete post");
			}
		},
		async handleNoteRename(file, oldPath) {
			if (data.posts[oldPath]) {
				data.posts[file.path] = data.posts[oldPath];
				delete data.posts[oldPath];
				await saveData(data);
			}
		},
		async handleNoteDelete(file) {
			if (data.posts[file.path]) {
				delete data.posts[file.path];
				await saveData(data);
			}
		},
	};
}
