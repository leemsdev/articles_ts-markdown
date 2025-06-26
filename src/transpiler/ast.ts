import { Token, TokenType } from "./tokens"

export enum NodeType {
	HEADING,
	TEXT,
	FORMATTING,
	SPACING,
}

type BaseNode = {
	type: NodeType,
}

export type HeadingNode = BaseNode & {
	level: number,
	content: Node[],
}

// We replace `ItalicNode` with `FormattingNode`
export type FormattingNode = BaseNode & {
	content: Node[],
	element: string
}

export type TextNode = BaseNode & {
	value: string,
}

// WhitespaceNode is just a text node but we 
// create a distinct type so we can handle it a little
// differently when emitting.
export type WhitespaceNode = TextNode

export type BlockQuoteNode = FormattingNode

export type Node = (HeadingNode | TextNode | FormattingNode | WhitespaceNode)

export type AST = {
	document: Node[],
}

type Parser = {
	tokens: Token[],
	cursor: number,
}

export function astToString(ast: AST) {
	return JSON.stringify(ast, null, 2)
}

function advance(parser: Parser): Token | null {
	let next = parser.tokens[parser.cursor]
	parser.cursor++
	return next
}

function peek(parser: Parser, amount: number = 0): Token | null {
	return parser.tokens[parser.cursor + amount]
}

function matchMultiple(parser: Parser, pattern: TokenType[]) {
	return pattern.every(type => peek(parser)?.type == type);
}

function parseHeading(parser: Parser): HeadingNode {
	let node: HeadingNode = {
		level: 1,
		content: [],
		type: NodeType.HEADING
	}

	while (true) {
		let next = peek(parser)

		if (!next) break;

		switch (next.type) {
			case TokenType.HEADING: {
				node.level++;
				advance(parser);
				continue;
			}
			case TokenType.NEWLINE: {
				return node;
			}
			default: {
				let contentNode = nodeFromToken(parser)

				if (!contentNode) break;

				node.content.push(contentNode)
			}
		}
	}

	return node
}


function parseFormattingToken(parser: Parser, type: TokenType, element: string) {
	let node: FormattingNode = {
		content: [],
		type: NodeType.FORMATTING,
		element,
	}

	while (true) {
		let next = peek(parser)

		if (!next) break;

		if (next.type == type || next.type == TokenType.NEWLINE) {
			advance(parser)
			break;
		}

		let contentNode = nodeFromToken(parser)

		if (!contentNode) break;

		node.content.push(contentNode)
	}

	return node
}

function parseText(current: Token): TextNode {
	return { type: NodeType.TEXT, value: current.literal }
}

function parseWhitespace(current: Token): WhitespaceNode {
	return { type: NodeType.SPACING, value: current.literal }
}

function parseBlockQuote(parser: Parser) {
	return parseFormattingToken(parser, TokenType.CODE, "code")
}

function parseCode(parser: Parser) {
	// If the next two tokens are not backticks, then this is
	// a one-line code block.
	if (!matchMultiple(parser, [TokenType.CODE, TokenType.CODE])) {
		return parseFormattingToken(parser, TokenType.CODE, "code")
	}

	// If not, we will consume those two tokens and then
	// continue parsing until we find the closing pattern,
	// which is three backticks.
	advance(parser)
	advance(parser)

	let node: FormattingNode = {
		type: NodeType.FORMATTING,
		element: "code",
		content: [],
	}

	while (true) {
		let next = peek(parser)

		if (!next) break;

		// try to match the pattern again
		if (next.type === TokenType.CODE && matchMultiple(parser, [TokenType.CODE, TokenType.CODE, TokenType.CODE])) {
			// consume these tokens and return the finished token.
			advance(parser)
			advance(parser)
			advance(parser)
			break;
		}

		// Code blocks are special in that we will simply ignore all formatting tokens inside of one.
		// So we just process everything as text or a new line.
		if (next.type === TokenType.NEWLINE) {
			node.content.push({ type: NodeType.SPACING, value: '\n' })
		} else {
			node.content.push({ type: NodeType.TEXT, value: next.literal })
		}

		advance(parser)
	}

	return node
}


function nodeFromToken(parser: Parser) {
	let current = advance(parser)

	switch (current?.type) {
		case TokenType.HEADING: return parseHeading(parser)
		case TokenType.TEXT: return parseText(current)
		case TokenType.BOLD: return parseFormattingToken(parser, TokenType.BOLD, "strong")
		case TokenType.ITALIC: return parseFormattingToken(parser, TokenType.ITALIC, "i")
		case TokenType.CODE: return parseCode(parser)
		case TokenType.BLOCKQUOTE: return parseBlockQuote(parser)
		case TokenType.SPACE: return parseWhitespace(current)
		case TokenType.NEWLINE: return parseWhitespace(current)
		default: return
	}
}

export function parse(tokens: Token[]) {
	let parser: Parser = {
		tokens,
		cursor: 0,
	}

	console.log(tokens)

	let ast: AST = { document: [] }

	while (parser.cursor < tokens.length) {
		let node = nodeFromToken(parser)

		if (!node) continue;

		ast.document.push(node)
	}

	return ast
}
