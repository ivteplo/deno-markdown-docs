//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

export class Markdown {
	/**
	 * @param {string} name
	 * @param {number} level
	 */
	static title(name, level = 1) {
		return "#".repeat(Math.max(level, 1)) + " " + name
	}

	/**
	 * @param {string} name
	 * @param {string} information
	 */
	static property(name, information) {
		return `**${name}**: ${information}`
	}

	/**
	 * @see https://gist.github.com/scmx/eca72d44afee0113ceb0349dd54a84a2
	 */
	static dropdown(summary, contents) {
		return (
			"<details open>\n" +
				`<summary>${summary}</summary>\n` +
				`\n` +
				`${contents}\n` +
				`\n` +
			"</details>"
		)
	}
}

export default Markdown
