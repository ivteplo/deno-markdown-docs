#!/usr/bin/env deno
//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

import { doc as readJSDoc } from "deno_doc"
import * as path from "deno:path"
import yargs from "yargs"

import { DocumentationGenerator } from "../mod.js"

function parseArgs() {
	const args = yargs(Deno.args)
		.command("*", "generate documentation for a JavaScript file")
		.positional("input-file", {
			describe: "file to document",
			demandOption: true,
			type: "string"
		})
		.option("output", {
			alias: "o",
			type: "string",
			description: "Output file path",
			default: ""
		})
		.parse()

	return {
		inputFiles: args._,
		outputFile: args.output
	}
}

async function main() {
	const { inputFiles, outputFile } = parseArgs()

	if (!inputFiles) {
		console.error("No input file specified")
		Deno.exit(1)
	}

	const documentationInJSON = (await Promise.all(
		inputFiles
			.map(inputFile => path.toFileUrl(path.resolve(inputFile)).toString())
			.map(inputFileURLString => readJSDoc(inputFileURLString))
	)).flat()

	const generator = new DocumentationGenerator()

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

main().catch(console.error)
