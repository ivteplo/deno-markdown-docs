//
// Copyright (c) 2024 Ivan Teplov
// Licensed under the Apache license 2.0
//

export function join(items, separator = " ") {
	return (Array.isArray(items) && items || [])
		.filter(Boolean)
		.map(string => string.trim())
		.join(separator)
}
