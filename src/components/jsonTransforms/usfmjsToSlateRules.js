import {identity, pathRule} from "json-transforms";

const NumberTypeEnum = {"chapter": 1, "verse": 2};
const NumberTypeNames = new Map([
    [NumberTypeEnum.chapter, "chapterNumber"],
    [NumberTypeEnum.verse, "verseNumber"]
]);

function bareTextNode(textString) {
    return {
        "object": "text",
        "text": textString,
        "marks": []
    };
}

function inlineTextNode(hasText) {
    return {
        "object": "inline",
        "type": "textWrapper",
        "data": {"source": hasText},
        "nodes": [bareTextNode(hasText.text)]
    };
}

function inlineContentNode(hasContent) {
    return {
        "object": "inline",
        "type": "contentWrapper",
        "data": {"source": hasContent},
        "nodes": [bareTextNode(hasContent.content)]
    };
}

function inlineBlock(children) {
    return {
        "object": "block",
        "type": "inlineBlock",
        "data": {},
        "nodes": [].concat(children)
    };
}

function numberNode(numberType, number) {
    return {
        "object": "block",
        "isVoid": true,
        "type": NumberTypeNames.get(numberType),
        "data": {},
        "nodes": [bareTextNode(number)]
    };
}

function headersNode(sourceArray, runner) {
    return {
        "object": "block",
        "type": "headers",
        "data": {"source": sourceArray},
        "nodes": [].concat(runner(sourceArray))
    };
}

/** json-transforms rules to produce a Slate-compatible JSON tree */
export const slateRules = [
    pathRule(
        '.chapters',
        d => {
            const processedHeaders = headersNode(d.context.headers, d.runner);
            const processedChapters = d.runner(d.context.chapters);
            return ({
                "object": "block",
                "type": "book",
                "data": {},
                "nodes": [processedHeaders].concat(processedChapters)
            });
        }
    ),
    pathRule(
        '.chapterNumber',
        d => ({
            "object": "block",
            "type": "chapter",
            "data": {"source": d.context.source},
            "nodes": [
                numberNode(NumberTypeEnum.chapter, d.match),
                inlineBlock(d.runner(d.context.verses))
            ]
        })
    ),
    pathRule(
        '.verseNumber',
        d => ({
            "object": "block",
            "type": "verse",
            "data": {"source": d.context.source},
            "nodes": [
                numberNode(NumberTypeEnum.verse, d.match),
                inlineBlock(d.runner(d.context.nodes))
            ]
        })
    ),
    pathRule(
        '.tag',
        d => ({
            "object": "inline",
            "type": d.match,
            "data": {"source": d.context},
            "nodes": [
                d.context.text ? inlineTextNode(d.context) : null,
                d.context.content ? inlineContentNode(d.context) : null
            ]
                .concat(d.context.children ? d.runner(d.context.children) : null)
                .filter(el => el) // filter out nulls
        })
    ),
    pathRule(
        '.text',
        d => inlineTextNode(d.context)
    ),
    identity
];
