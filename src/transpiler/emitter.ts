import { AST, HeadingNode, ItalicNode, Node, NodeType, TextNode } from "./ast";

function emitHeading(node: HeadingNode): string {

	let level = node.level;
	let htmlStr = `<h${level}>`

	for (const n of node.content) {
		htmlStr += emit(n)
	}

	htmlStr += `</h${level}>`

	return htmlStr
}

function emitItalic(node: ItalicNode): string {
	let htmlStr = ""

	for (const n of node.content) {
		htmlStr += emit(n)
	}

	return `<i>${htmlStr}</i>\n`
}

function emitText(node: TextNode): string {
	return node.value
}

function emit(node: Node): string {
	switch (node.type) {
		case NodeType.HEADING: return emitHeading(node as HeadingNode)
		case NodeType.ITALIC: return emitItalic(node as ItalicNode)
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
