import { AST, HeadingNode, FormattingNode, Node, NodeType, TextNode, WhitespaceNode } from "./ast";

function emitHeading(node: HeadingNode): string {

	let level = node.level;
	let htmlStr = `<h${level}>`

	for (const n of node.content) {
		htmlStr += emit(n)
	}

	htmlStr += `</h${level}>`

	return htmlStr
}

function emitFormatted(node: FormattingNode): string {
	let htmlStr = ""

	for (const n of node.content) {
		htmlStr += emit(n)
	}

	return `<${node.element}>${htmlStr}</${node.element}>`
}

function emitText(node: TextNode): string {
	return node.value
}

function emitWhitespace(node: WhitespaceNode): string {
	switch (node.value) {
		case "\n": return "<br />"
		case " ": return "&nbsp;"
	}

	return ""
}

function emit(node: Node): string {
	switch (node.type) {
		case NodeType.HEADING: return emitHeading(node as HeadingNode)
		case NodeType.FORMATTING: return emitFormatted(node as FormattingNode)
		case NodeType.SPACING: return emitWhitespace(node as WhitespaceNode)
		default: return emitText(node as TextNode)
	}
}

export default function emitHtml(ast: AST) {
	let htmlStr = ""
	let nodes = ast.document;

	for (const n of nodes) {
		htmlStr += emit(n)
	}

	return htmlStr
}
