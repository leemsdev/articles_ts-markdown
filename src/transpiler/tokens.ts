export enum TokenType {
	HEADING = "heading",
	TEXT = "text",
	ITALIC = "italic",
	NEWLINE = "newline",

	BOLD = "bold",
}

const FormattingCharacters = ['*', '_']
const WhitespaceCharacters = ['\n', ' ']

export type Token = {
	type: TokenType,
	literal: string
}

type Scanner = {
	cursor: number,
	src: string,
}

export function tokensToStr(tokens: Token[]) {
	return tokens
		.map(t => `Token(type=${t.type}, literal=${t.literal})`)
		.join('\n')
}

function isRecognisedTok(i: number, src: string): boolean {
	const delimiters = WhitespaceCharacters.concat(FormattingCharacters)

	if (!FormattingCharacters.includes(src[i])) {
		return false;
	}

	let prev = src[i - 1] ?? ' '
	let next = src[i + 1] ?? ' '

	return delimiters.includes(prev) || delimiters.includes(next)
}

function consumeText(start: number, src: string): string {
	let i = start
	let c = src[i]

	let text = ""

	while (i < src.length && c != '\n') {
		if (isRecognisedTok(i, src)) {
			break;
		}

		text += c
		c = src[++i]
	}

	return text
}

function tokenFromChar(scanner: Scanner) {
	let { cursor, src } = scanner;
	let c = src[cursor]

	switch (c) {
		case '#': {
			scanner.cursor += 1;
			return { type: TokenType.HEADING, literal: c }
		}
		case '_': {
			scanner.cursor += 1;
			return { type: TokenType.ITALIC, literal: c }
		}
		case '*': {
			scanner.cursor += 1;
			return { type: TokenType.BOLD, literal: c }
		}
		case '\n': {
			scanner.cursor += 1;
			return { type: TokenType.NEWLINE, literal: c }
		}
		case ' ': {
			scanner.cursor += 1;
			return null
		}
		default: {
			const text = consumeText(cursor, src)

			scanner.cursor += text.length

			return { type: TokenType.TEXT, literal: text }
		}
	}
}

export function tokenize(src: string) {
	let tokens: Token[] = []

	const scanner: Scanner = {
		src,
		cursor: 0,
	}

	while (scanner.cursor < src.length) {
		let token = tokenFromChar(scanner)

		// Sometimes we won't product a token, like for whitespace characters
		if (!token) continue

		tokens.push(token)
	}

	return tokens
}
