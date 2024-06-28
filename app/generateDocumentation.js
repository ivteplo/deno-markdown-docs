#!/usr/bin/env deno
//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

import { doc as readJSDoc } from "https://deno.land/x/deno_doc@0.117.0/mod.ts"
import * as path from "https://deno.land/std@0.207.0/path/mod.ts"

import { DocumentationGenerator } from "../mod.js"

async function main() {
	const inputFile = Deno.args?.[0]

	if (!inputFile) {
		console.error("No input file specified")
		Deno.exit(1)
	}

	const inputFileURLString = path.toFileUrl(path.resolve(inputFile)).toString()
	const documentationInJSON = await readJSDoc(inputFileURLString)

	const documentationInMarkdown = documentationInJSON
		.filter(DocumentationGenerator.isObjectDocumentationToBeDisplayed)
		.map(object => DocumentationGenerator.generate(object))
		.join("\n\n\n\n") + "\n"

	console.log(documentationInMarkdown)
}

await main()
