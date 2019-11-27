import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";

export function usfmToSlateJson(usfm, insertTrailingNewline = false) {
    const usfmJson = usfmjs.toJSON(usfm).headers[0]
    if (insertTrailingNewline) {
        usfmJson.content = usfmJson.content + "\n"
    }
    const slateJson = usfmJsonToSlateJson(usfmJson)
    return slateJson
}

function usfmJsonToSlateJson(usfmJson, isInitialization) {
    const transformations = isInitialization
        ? [ objectToArrayRules, slateRules ]
        : [ slateRules ];

    const transformedJson = transformations.reduce(transformOneRuleset, usfmJson);
    return transformedJson;
}

export function toUsfmJsonDocAndSlateJsonDoc(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);
    console.debug("usfmJsDocument", usfmJsDocument);

    const transformedJson = usfmJsonToSlateJson(usfmJsDocument, true)

    const slateDocument = {
        "object": "value",
        "document": {
            "object": "document",
            "data": {},
            "nodes": [transformedJson]
        }
    };
    console.debug("slateDocument", slateDocument);

    return {usfmJsDocument, slateDocument};
}

function transformOneRuleset(json, rules) {
    const transformed = transform(json, rules);
    console.debug("JSON transformation result", transformed);
    return transformed;
}