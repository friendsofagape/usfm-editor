import NodeTypes from "./NodeTypes"
import { UsfmMarkers }from "./UsfmMarkers"

const NodeRules = {

    isFormattableBlockType(type: string): boolean {
        return type === NodeTypes.INLINE_CONTAINER || 
            UsfmMarkers.isParagraphType(type)
    },

    canMergeAIntoB(typeA: string, typeB: string): boolean {
        return typeA === NodeTypes.INLINE_CONTAINER &&
            (
                typeB === NodeTypes.INLINE_CONTAINER ||
                // Inline containers should not be merged into just any paragraph-type marker
                // (such as section headers)
                typeB === UsfmMarkers.PARAGRAPHS.p 
            )
    }
}
export default NodeRules