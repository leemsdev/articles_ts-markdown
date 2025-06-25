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

function peek(parser: Parser): Token | null {
	return parser.tokens[parser.cursor]
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


function nodeFromToken(parser: Parser) {
	let current = advance(parser)

	switch (current?.type) {
		case TokenType.HEADING: return parseHeading(parser)
		case TokenType.TEXT: return parseText(current)
		case TokenType.BOLD: return parseFormattingToken(parser, TokenType.BOLD, "strong")
		case TokenType.ITALIC: return parseFormattingToken(parser, TokenType.ITALIC, "i")
		case TokenType.CODE: return parseFormattingToken(parser, TokenType.CODE, "code")
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

	let ast: AST = { document: [] }

	while (parser.cursor < tokens.length) {
		let node = nodeFromToken(parser)

		if (!node) continue;

		ast.document.push(node)
	}

	console.log(JSON.stringify(ast, null, 2))

	return ast
}
