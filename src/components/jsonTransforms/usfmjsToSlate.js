import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";

export function usfmToSlateJson(usfm, insertTrailingNewLine = false) {
    const usfmJson = usfmjs.toJSON(usfm).headers[0]
    if (insertTrailingNewLine) {
        usfmJson.content = usfmJson.content + "\n"
    }
    const slateJson = usfmJsontoSlateJson(usfmJson)
    return slateJson
}

function usfmJsontoSlateJson(usfmJson, isInitialization) {
    const transformations = [ slateRules ];
    if (isInitialization) {
        transformations.unshift(objectToArrayRules)
    }

    const transformedJson = transformations.reduce(transformOneRuleset, usfmJson);
    return transformedJson;
}

export function toUsfmJsonDocAndSlateJsonDoc(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);
    console.debug("usfmJsDocument", usfmJsDocument);

    const transformedJson = usfmJsontoSlateJson(usfmJsDocument, true)

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