function flatten(obj: Record<string, any>) {
	const result: { [key: string]: string } = {};

	for (const key of Object.keys(obj)) {
		const value = obj[key];

		if (typeof value === 'string') {
			result[key] = value;
		} else {
			const inner = flatten(value);
			for (const innerKey of Object.keys(inner)) {
				result[`${key}.${innerKey}`] = inner[innerKey];
			}
		}
	}

	return result;
};

const strings = flatten({
	serviceName: 'Obsius',
	actions: {
		create: {
			name: 'Publish to Obsius',
			failure: 'Failed to publish file to Obsius'
		},
		update: {
			name: 'Update in Obsius',
			success: 'Updated file in Obsius',
			failure: 'Failed to update file in Obsius'
		},
		showUrl: {
			name: 'Show published URL',
			failure: 'File not yet published'
		},
		remove: {
			name: 'Remove from Obsius',
			success: 'File removed from Obsius',
			failure: 'Failed to remove file form Obsius'
		},
	},
	modals: {
		showUrl: {
			title: 'File published at:',
			copy: 'Copy URL',
		}
	}
});

export function getText(path: string, ...args: string[]) {
	const value = strings[path];
	if (value !== undefined) {
		if (args.length) {
			return `${value}: ${args.join(', ')}`;
		}

		return value;
	}

	return path;
}
