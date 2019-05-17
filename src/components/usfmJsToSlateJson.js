import {identity, pathRule, transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmJsStructuralTransform";

const NumberTypeEnum = {"chapter": 1, "verse": 2};
const NumberNames = new Map([ [NumberTypeEnum.chapter, "chapterNumber"], [NumberTypeEnum.verse, "verseNumber"] ]);

function textNode(textString) {
    return {
        "object": "text",
        "text": textString,
        "marks": []
    };
}

function numberNode(numberType, number) {
    return {
        "object": "inline",
        "type": NumberNames.get(numberType),
        "data": {},
        "nodes": [textNode(number)]
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

const slateRules = [
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
            "nodes": [numberNode(NumberTypeEnum.chapter, d.match)]
                .concat(d.runner(d.context.verses))
        })
    ),
    pathRule(
        '.verseNumber',
        d => ({
            "object": "inline",
            "type": "verse",
            "data": {"source": d.context.source},
            "nodes": [numberNode(NumberTypeEnum.verse, d.match)]
                .concat(d.runner(d.context.nodes))
        })
    ),
    pathRule(
        '.tag',
        d => ({
            "object": "inline",
            "type": d.match,
            "data": {source: d.context},
            "nodes": [
                d.context.text ? textNode(d.context.text) : null,
                d.context.content ? textNode(d.context.content) : null
            ]
                .concat(d.context.children ? d.runner(d.context.children) : null)
                .filter(el => el)
        })
    ),
    pathRule(
        '.text',
        d => textNode(d.match)
    ),
    identity
];

export function usfmJsToSlateJson(usfm) {
    const parsed = usfmjs.toJSON(usfm);
    console.debug("parsed", parsed);

    const restructured = transform(parsed, objectToArrayRules);
    // console.debug("restructured", restructured);

    const slateDocument = {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [transform(restructured, slateRules)]
        }
    };
    console.debug("slateDocument", slateDocument);

    return slateDocument;
}
