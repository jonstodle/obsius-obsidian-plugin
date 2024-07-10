function flatten(obj: Record<string, any>) {
	const result: { [key: string]: string } = {};

	for (const key of Object.keys(obj)) {
		const value = obj[key];

		if (typeof value === "string") {
			result[key] = value;
		} else {
			const inner = flatten(value);
			for (const innerKey of Object.keys(inner)) {
				result[`${key}.${innerKey}`] = inner[innerKey];
			}
		}
	}

	return result;
}

const strings = flatten({
	serviceName: "Obsius",
	actions: {
		create: {
			name: "Publish to Obsius",
			success: "Note published to Obsius. URL copied to clipboard.",
			failure: "Failed to publish note to Obsius",
		},
		update: {
			name: "Update in Obsius",
			success:
				"Updated note in Obsius. It may take a little while before update becomes visible.",
			failure: "Failed to update note in Obsius",
		},
		copyUrl: {
			name: "Copy Obsius URL",
			success: "Obsius URL copied to clipboard",
			failure: "Note not yet published",
		},
		remove: {
			name: "Remove from Obsius",
			success: "Note removed from Obsius",
			failure: "Failed to remove note form Obsius",
		},
		listPosts: {
			name: "View published posts",
			title: "Published posts",
			showFile: "View file",
			showPost: "View post",
		},
	},
	modals: {
		showUrl: {
			title: "Note published at:",
			copy: "Copy URL",
		},
	},
});

export function getText(path: string, ...args: string[]) {
	const value = strings[path];
	if (value !== undefined) {
		if (args.length) {
			return `${value}: ${args.join(", ")}`;
		}

		return value;
	}

	return path;
}
