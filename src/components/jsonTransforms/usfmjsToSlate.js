import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";
import {sourceMapRules} from "./sourceMapRules"

export function toUsfmJsonAndSlateJson(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);

    const sourceMap = new Map();

    const transformations = [
        objectToArrayRules,
        slateRules,
        sourceMapRules(sourceMap)
    ];

    const transformedJson = transformations.reduce(transform, usfmJsDocument);

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

