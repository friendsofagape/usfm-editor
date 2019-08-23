export const NumberTypeEnum = {
    "chapter": 1,
    "verse": 2
};

export const chapterNumberName = "chapterNumber";
export const verseNumberName = "verseNumber";

export const fauxVerseNumber = "front";

export const NumberTypeNames = new Map([
    [NumberTypeEnum.chapter, chapterNumberName],
    [NumberTypeEnum.verse, verseNumberName]
]);

export const NumberNamesToTypes = new Map(Array.from(NumberTypeNames, entry => entry.reverse()));
