/**
 * Node types are types that can appear in the "type" field of a slate node 
 * (such as inlineContainer, p, or s). 
 * A node type may also be a usfm paragraph marker (such as p or id) or it may not 
 * (such as inlineContainer or header).
 * These types are not to be confused with mark types, which are usfm character markers
 * (such as \nd) that appear as slate marks to decorate text.
 */
export const NodeTypes = {
    // These paragraph node types are also usfm paragraph markers.
    // There are more paragraph markers listed later in this file, but these are the ones
    // that are currently well-supported.
    P: "p",
    S: "s",
    // These node types are not usfm markers. Most of them come from usfm-js.
    CHAPTER: "chapter",
    VERSE: "verse",
    CHAPTER_NUMBER: "chapterNumber",
    VERSE_NUMBER: "verseNumber",
    HEADERS: "headers",
    INLINE_CONTAINER: "inlineContainer", // Not from usfm-js

    isParagraphMarker(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return paragraphMarkers.has(baseType)
    },

    isRenderedParagraphMarker(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return renderedParagraphMarkers.has(baseType)
    },

    isUnRenderedParagraphMarker(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return unrenderedParagraphMarkers.has(baseType)
    },

    isVerseOrChapterNumberType(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return [this.CHAPTER_NUMBER, this.VERSE_NUMBER].includes(baseType)
    },

    isFormattableBlockType(type: string): boolean {
        return formattableBlockTypes.has(type)
    },

    isStructuralType(type: string): boolean {
        return structuralTypes.has(type)
    },

    canMergeAIntoB(typeA: string, typeB: string): boolean {
        if (typeA === NodeTypes.INLINE_CONTAINER) {
            if (typeB === NodeTypes.INLINE_CONTAINER ||
                typeB === NodeTypes.P
            ) {
                return true
            }
        }
        return false
    },

    destructureType(type: string) {
        const [, pluses, baseType, number] = type.match(/^(\+*)(.*?)(\d*)$/);
        return { pluses, baseType, number };
    }
}

const unnumberedParagraphMarkers = new Set([NodeTypes.P,"po","m","pr","cls","pmo","pm","pmc",
    "pmr","pmi","nb", "pc","b","pb","qr","qc","qd","lh","lf","sr","r","d","sp"])

const numberedParagraphMarkers =  new Set([NodeTypes.S,"pi","ph","q","qm","lim","sd"])

const unrenderedParagraphMarkers  = new Set(["id","mt","mte","ms","mr","ide","h","toc"])

/** 
 * These types are all usfm paragraph markers that are rendered 
 * by default in the slate editor
 */
const renderedParagraphMarkers = union(
    unnumberedParagraphMarkers,
    numberedParagraphMarkers
)

const paragraphMarkers = union(
    renderedParagraphMarkers,
    unrenderedParagraphMarkers
)

/**
 * These types are structural for the slate DOM and are not directly converted
 * to usfm tags.
 */
const structuralTypes = new Set([
    NodeTypes.HEADERS,
    NodeTypes.CHAPTER,
    NodeTypes.VERSE
])

/** These types are all represented as block type elements in the slate DOM
 * and can be formatted by block formatting buttons or other means.
 */
const formattableBlockTypes = union(
    paragraphMarkers,
    [NodeTypes.INLINE_CONTAINER]
)

function union<T>(
    setA: Set<T> | Array<T>, 
    setB: Set<T> | Array<T>
) {
    let union = new Set(setA)
    for (let elem of setB) {
        union.add(elem)
    }
    return union
}