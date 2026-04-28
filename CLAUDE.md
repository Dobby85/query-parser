# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm test           # run all tests (mocha)
npm run test-debug # run tests in watch mode
```

To run a single test file or describe block, use mocha directly:

```bash
npx mocha ./test/parser.js --grep "Parser"
```

## Architecture

This is a single-file Node.js module (`index.js`) with no dependencies. It exports a plain object `queryParserFunctions` with these methods:

- **`parse(queryParams)`** — public entry point; delegates to `splitInArray`
- **`splitInArray(queryParams)`** — iterates over the query object, handles repeated keys (arrays), and builds the result array of `{ key, value, comparator }` objects
- **`parseToIntIfNumber(value)`** — auto-casts numeric strings to `int`/`float`; strings with two or more dots (e.g. version numbers) are left as strings
- **`containsNumberOrLetter(value)`** — validates that a key only contains `[-_a-zA-Z0-9]`; keys that fail are silently skipped
- **`containsOnlyNumber(value)`** — used by `parseToIntIfNumber` to determine if casting is safe

### Parsing rules (in priority order, inside `splitInArray`)

1. Key validation — keys with characters outside `[-_a-zA-Z0-9]` are dropped
2. Comparator prefix (`value.includes(':')`) — e.g. `gt:23` → `{ comparator: '>', value: 23 }`; `lk:foo` wraps the value as `%foo%`
3. Array syntax (`value.includes(',')`) — e.g. `12,25,26` → `{ value: [12, 25, 26] }`
4. Plain value — defaults to `comparator: '='`

Repeated query params (same key, array value in the input object) produce multiple entries in the output array, each processed independently.

### Comparator map

| Token | SQL operator |
|-------|-------------|
| `gt`  | `>`         |
| `gte` | `>=`        |
| `lt`  | `<`         |
| `lte` | `<=`        |
| `df`  | `!=`        |
| `eq`  | `=`         |
| `lk`  | `LIKE`      |
