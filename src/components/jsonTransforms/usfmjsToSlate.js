import {transform} from "json-transforms";
import usfmjs from "usfm-js";
import {objectToArrayRules} from "./usfmjsStructureRules";
import {slateRules} from "./usfmjsToSlateRules";

export function toUsfmJsonAndSlateJson(usfm) {
    const usfmJsDocument = usfmjs.toJSON(usfm);
    console.debug("parsed", usfmJsDocument);

    const restructured = transform(usfmJsDocument, objectToArrayRules);
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

    return {usfmJsDocument, slateDocument};
}
