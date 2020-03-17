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

    isMarkType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return markTypes.includes(baseType)
    },

    isNewlineBlockType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return newlineBlockTypes.includes(baseType)
    },

    isVerseOrChapterNumberType(type: String): Boolean {
        const { baseType } = this.destructureType(type)
        return [this.CHAPTER_NUMBER, this.VERSE_NUMBER].includes(baseType)
    },

    isVerseContentBlockType(type: string): Boolean {
        return verseContentBlockTypes.includes(type)
    },

    destructureType(type: String) {
        const [, pluses, baseType, number] = type.match(/^(\+*)(.*?)(\d*)$/);
        return { pluses, baseType, number };
    }
}

const markTypes = [
    NodeTypes.ND,
    NodeTypes.BK
]

const newlineBlockTypes = [
    NodeTypes.P,
    NodeTypes.S
]

const verseContentBlockTypes = newlineBlockTypes
    .concat(NodeTypes.INLINE_CONTAINER)