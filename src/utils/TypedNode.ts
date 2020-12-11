import { Node } from "slate"

export type TypedNode = Node & { type: string }

export function isTypedNode(node: Node): node is TypedNode {
    return "type" in node
}
