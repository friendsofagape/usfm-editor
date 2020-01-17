export const nodeTypes = {
    TEXTWRAPPER: "textWrapper",
    CONTENTWRAPPER: "contentWrapper",
    P: "p",
    ND: "nd",
    S: "s",
    BK: "bk",
    BOOK: "book",
    CHAPTER: "chapter",
    CHAPTER_BODY: "chapterBody",
    VERSE: "verse",
    VERSE_BODY: "verseBody"
}

/**
 * These nodes demand special formatting and have the
 * characteristics of "inline" nodes as defined below
 */
const inlineFormattingNodeTypes = [
    nodeTypes.ND,
    nodeTypes.BK
]

/**
 * Not truly "inline" nodes, but nodes that appear as such
 * and do NOT start on a new line
 */
const inlineNodeTypes = [
    nodeTypes.TEXTWRAPPER,
    nodeTypes.CONTENTWRAPPER
].concat(inlineFormattingNodeTypes)

/**
 * Nodes that start on a new line 
 */
const newlineNodeTypes = [
    nodeTypes.P,
    nodeTypes.S
]

/**
 * Nodes that exist within verses (everything except book, chapter, verse, etc.)
 */
const verseContentTypes = 
    inlineNodeTypes
    .concat(newlineNodeTypes)

export function isInlineFormattingNodeType(type) {
    return inlineFormattingNodeTypes.includes(type)
}

export function isInlineNodeType(type) {
    return inlineNodeTypes.includes(type)
}

export function isNewlineNodeType(type) {
    return newlineNodeTypes.includes(type)
}

export function isVerseContentType(type) {
    return verseContentTypes.includes(type)
}