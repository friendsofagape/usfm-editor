export const NodeTypes = {
    TEXTWRAPPER: "textWrapper",
    P: "p",
    ND: "nd",
    S: "s",
    BK: "bk",
    CHAPTER: "chapter",
    VERSE: "verse",

    isInlineFormattingNodeType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return inlineFormattingNodeTypes.includes(baseType)
    },
    
    isInlineNodeType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return inlineNodeTypes.includes(baseType)
    },
    
    isNewlineNodeType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return newlineNodeTypes.includes(baseType)
    },
    
    isVerseContentType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return verseContentTypes.includes(baseType)
    },

    destructureType(type: String) {
        const [, pluses, baseType, number] = type.match(/^(\+*)(.*?)(\d*)$/);
        return {pluses, baseType, number};
    }
}

/**
 * These nodes demand special formatting and have the
 * characteristics of "inline" nodes as defined below
 */
const inlineFormattingNodeTypes = [
    NodeTypes.ND,
    NodeTypes.BK
]

/**
 * Not truly "inline" nodes, but nodes that appear as such
 * and do NOT start on a new line
 */
const inlineNodeTypes = [
    NodeTypes.TEXTWRAPPER,
].concat(inlineFormattingNodeTypes)

/**
 * Nodes that start on a new line 
 */
const newlineNodeTypes = [
    NodeTypes.P,
    NodeTypes.S
]

/**
 * Nodes that exist within verses (everything except chapter, verse, etc.)
 */
const verseContentTypes = 
    inlineNodeTypes
    .concat(newlineNodeTypes)