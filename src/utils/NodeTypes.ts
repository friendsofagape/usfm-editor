export const NodeTypes = {
    P: "p",
    ND: "nd",
    S: "s",
    BK: "bk",
    ID: "id",
    CHAPTER: "chapter",
    VERSE: "verse",
    INLINE_CONTAINER: "inlineContainer",
    CHAPTER_NUMBER: "chapterNumber",
    VERSE_NUMBER: "verseNumber",
    HEADERS: "headers",

    isMarkType(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return markTypes.includes(baseType)
    },

    isNewlineBlockType(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return newlineBlockTypes.includes(baseType)
    },

    isVerseOrChapterNumberType(type: string): boolean {
        const { baseType } = this.destructureType(type)
        return [this.CHAPTER_NUMBER, this.VERSE_NUMBER].includes(baseType)
    },

    isVerseContentBlockType(type: string): boolean {
        return verseContentBlockTypes.includes(type)
    },

    isStructuralType(type: string): boolean {
        return structuralTypes.includes(type)
    },

    destructureType(type: string) {
        const [, pluses, baseType, number] = type.match(/^(\+*)(.*?)(\d*)$/);
        return { pluses, baseType, number };
    }
}

const unNumberedParagraphTypes = ["po","m","pr","cls","pmo","pm","pmc","pmr","pmi","nb",
    "pc","b","pb","qr","qc","qd","lh","lf","p"]

const numberedParagraphTypes =  ["pi","ph","q","qm","lim"]

const markTypes = [
    NodeTypes.ND,
    NodeTypes.BK
]

const newlineBlockTypes = [
    NodeTypes.P,
    NodeTypes.S
].concat(
    unNumberedParagraphTypes,
    numberedParagraphTypes
)

const structuralTypes = [
    NodeTypes.HEADERS,
    NodeTypes.CHAPTER,
    NodeTypes.VERSE
]

const verseContentBlockTypes = newlineBlockTypes
    .concat(NodeTypes.INLINE_CONTAINER)