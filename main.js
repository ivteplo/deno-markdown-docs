#!/usr/bin/env deno
//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

import { readJSDoc, path, yargs } from "./deps.js"
import { version, DocumentationGenerator } from "./mod.js"


export function parseArgs() {
	const command = yargs(Deno.args)
		.version(version)
		.command(
			"$0 <input-file>", "generate documentation for a JavaScript file",
			yargs => yargs.positional("input-file", {
				describe: "file to document",
				demandOption: true,
				type: "string"
			}),
			() => {}
		)
		.option("output", {
			alias: "o",
			type: "string",
			description: "Output file path",
			default: ""
		})
		.strict()
		.showHelpOnFail(true)

	const args = command.parse()

	return {
		inputFile: args.inputFile,
		outputFile: args.output
	}
}

export async function main({ inputFile, outputFile }) {
	if (!inputFile) {
		console.error("No input file specified")
		Deno.exit(1)
	}

	const generator = new DocumentationGenerator()

	const inputFileUrlString = path.toFileUrl(path.resolve(inputFile)).toString()
	const documentationInJSON = await readJSDoc(inputFileUrlString)

	const documentationInMarkdown = documentationInJSON
		.filter(generator.isObjectDocumentationToBeDisplayed)
		.map(object => generator.generate(object))
		.join("\n\n\n\n") + "\n"

	if (outputFile === "") {
		console.log(documentationInMarkdown)
	} else {
		try {
			await Deno.writeTextFile(outputFile, documentationInMarkdown)
		} catch (error) {
			console.error("Could not save documentation to the file:", error.toString())
			console.error("Printing the output to the console")
			console.log(documentationInMarkdown)
		}
	}
}

if (import.meta.main) {
	main(parseArgs()).catch(console.error)
}
