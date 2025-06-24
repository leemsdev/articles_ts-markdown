import { Token, TokenType } from "./tokens"

export enum NodeType {
	HEADING,
	TEXT,
	ITALIC,
}

type BaseNode = {
	type: NodeType,
}

export type HeadingNode = BaseNode & {
	level: number,
	content: Node[],
}

export type ItalicNode = BaseNode & {
	content: Node[]
}

export type TextNode = BaseNode & {
	value: string,
}

export type Node = (HeadingNode | TextNode | ItalicNode)

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

		if (next.type == TokenType.HEADING) {
			node.level++
			advance(parser)
			continue;
		}

		let contentNode = nodeFromToken(parser)

		if (!contentNode) break;

		node.content.push(contentNode)
	}

	return node
}

function parseItalic(parser: Parser): ItalicNode {
	let node: ItalicNode = {
		content: [],
		type: NodeType.ITALIC
	}

	while (true) {
		let next = peek(parser)

		if (!next) break;

		// If we see the closing italic, consume it and exit
		if (next.type == TokenType.ITALIC) {
			advance(parser);
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


function nodeFromToken(parser: Parser) {
	let current = advance(parser)

	switch (current?.type) {
		case TokenType.HEADING: return parseHeading(parser)
		case TokenType.ITALIC: return parseItalic(parser)
		case TokenType.TEXT: return parseText(current)
		case TokenType.NEWLINE: return
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

	return ast
}
