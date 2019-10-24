import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";
import {sourceMapRules} from "./sourceMapRules"

/**
 * @param {Map} sourceMap 
 */
export function toSlateJson(usfmJson, sourceMap) {
    const transformations = [
        slateRules,
        sourceMapRules(sourceMap)
    ];
    if (sourceMap.size == 0) {
        transformations.unshift(objectToArrayRules)
    }

    const transformedJson = transformations.reduce(transformOneRuleset, usfmJson);
    return transformedJson;
}

export function toUsfmJsonDocAndSlateJsonDoc(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);
    console.debug("usfmJsDocument", usfmJsDocument);

    const sourceMap = new Map();

    const transformedJson = toSlateJson(usfmJsDocument, sourceMap)

    const slateDocument = {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [transformedJson]
        }
    };
    console.debug("slateDocument", slateDocument);

    return {usfmJsDocument, slateDocument, sourceMap};
}

function transformOneRuleset(json, rules) {
    const transformed = transform(json, rules);
    console.debug("JSON transformation result", transformed);
    return transformed;
}

export function toUsfmJsonNode(usfm) {
    return usfmjs.toJSON(usfm).headers[0]
}