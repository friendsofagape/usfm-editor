import NodeTypes from "./NodeTypes"
import { UsfmMarkers } from "./UsfmMarkers"
import { Node } from "slate"

function isFormattableBlockType(nodeOrTypeString: string | Node): boolean {
    const type = typeString(nodeOrTypeString)
    return (
        type === NodeTypes.INLINE_CONTAINER ||
        (type !== undefined && UsfmMarkers.isParagraphType(type))
    )
}

function typeString(nodeOrTypeString: string | Node): string | undefined {
    if (typeof nodeOrTypeString === "string") return nodeOrTypeString
    if (typeof nodeOrTypeString.type === "string") return nodeOrTypeString.type
    return undefined
}

function canMergeAIntoB(typeA: string, typeB: string): boolean
function canMergeAIntoB(a: Node, b: Node): boolean
function canMergeAIntoB(a: string | Node, b: string | Node): boolean {
    const typeA = typeString(a)
    const typeB = typeString(b)
    return (
        typeA === NodeTypes.INLINE_CONTAINER &&
        (typeB === NodeTypes.INLINE_CONTAINER ||
            // Inline containers should not be merged into just any paragraph-type marker
            // (such as section headers)
            typeB === UsfmMarkers.PARAGRAPHS.p)
    )
}

export default {
    isFormattableBlockType,
    canMergeAIntoB,
}
