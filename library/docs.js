#!/usr/bin/env deno
//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

import { Markdown } from "./output/markdown.js"
import { join } from "./helpers.js"


export class DocumentationGenerator {
	#outputFormat

	constructor() {
		this.#outputFormat = Markdown
	}

	#generateFunctionArgumentDocumentation(argument, functionTags) {
		if (argument.kind === "assign") {
			return this.#generateFunctionArgumentDocumentation(argument.left, functionTags) + ` = ${argument.right}`
		}

		let result = argument.name

		if (argument.optional) {
			result += "?"
		}

		const paramDocumentation = functionTags
			.find(tag => tag.kind === "param" && tag.name === argument.name)

		if (paramDocumentation) {
			result += `: ${paramDocumentation.type}`
		}

		return result
	}

	#generateObjectName(object) {
		let name = object.name

		switch (object.kind) {
			case "getter":
			case "setter":
				name = `${object.kind === "getter" ? "get" : "set"} ${name}`
			case "function":
			case "method":
				if (object.functionDef.isAsync) {
					name = `async ${name}`
				}

				name += "(" + object.functionDef.params.map(argument => this.#generateFunctionArgumentDocumentation(argument, object.jsDoc?.tags ?? [])).join(", ") + ")"
				name += ": " + (object.functionDef.returnType?.repr ?? object.jsDoc?.tags.find(tag => tag.kind === "return")?.type ?? "unknown")
				break
		}

		if (object.isStatic) {
			name = "static " + name
		}

		return "`" + name + "`"
	}

	#generateTags(object) {
		if (!object.jsDoc?.tags) {
			object.jsDoc ??= {}
			object.jsDoc.tags = []
		}

		if (["function", "method", "getter", "setter"].indexOf(object.kind) !== -1) {
			object.jsDoc.tags = object.jsDoc.tags.filter(tag => tag.kind !== "param" && tag.kind !== "return")
		}

		return object.jsDoc.tags.map(
			tag => tag.kind === "example"
				? this.#generateExample(tag)
				: this.#outputFormat.property(
					join([tag.kind, tag.name], " "),
					tag?.doc ?? tag?.type ?? ""
				)
		)
	}

	#generateExample(tag) {
		const summaryMatchGroup = /\<caption\>(([^\<\n]|<\/?i>|<\/?b>|<\/?u>|<\/?a>)*)\<\/caption\>/.exec(tag.doc)
		const summaryString = summaryMatchGroup?.[1] ?? ""
		const summaryCode = summaryString ? `<b>Example:</b> ${summaryString}` : "<b>Example</b>"

		const code = tag.doc
			.substring(summaryMatchGroup?.[0].length ?? 0)
			.trim()

		return this.#outputFormat.dropdown(summaryCode, "```jsx\n" + code + "\n```")
	}

	generate(object, deepnessLevel = 1) {
		return join([
			join([
				this.#outputFormat.title(this.#generateObjectName(object), deepnessLevel),
				object.jsDoc?.doc,
				...this.#generateTags(object),
			], "\n\n"),
			...(object.classDef?.properties.map(property => this.generate(property, deepnessLevel + 1)) ?? []),
			...(object.classDef?.methods.map(method => this.generate(method, deepnessLevel + 1)) ?? []),
		], "\n\n\n")
	}

	isObjectDocumentationToBeDisplayed(object) {
		return object.name !== "default" && object.declarationKind === "export"
	}
}
