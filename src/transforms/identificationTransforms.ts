import * as usfmjs from "usfm-js";
import { Node, Editor } from 'slate';
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { transformToSlate } from "./usfmToSlate";
import clonedeep from "lodash/cloneDeep"

/**
 * Applies the desired updates to an identification json object
 *  
 * @param {Object} current - Json specifying the current identificaton 
 *      headers
 * @param {Object} updates - Json specifying the identification headers
 *      to add, update, or remove, and the desired values.
 *      example: {'toc1': 'new_toc1', 'id': 'updated_id'}
 *      Unspecified headers will be kept the same.
 *      To delete a header, pass a null value like {'toc1': null}
 * @returns The updated identification json
 */
export function mergeIdentification(
    current: Object,
    updates: Object
): Object {
    const updatedJson = clonedeep(current)
    Object.assign(updatedJson, updates)

    Object.entries(updatedJson)
        .forEach( ([marker, value]) => {
            if (value === null) {
                delete updatedJson[marker]
            }
        })
    return updatedJson
}

export function filterInvalidIdentification(idJson: Object): Object {
    if (!idJson) return null
    const validIdJson = {}
    Object.entries(idJson)
        .forEach( ([marker, value]) => {
            if (! isValidIdentificationMarker(marker)) {
                console.error("Invalid marker: ", marker)
            } else if (! isValidMarkerValuePair(marker, value)) {
                console.error("Invalid marker, value pair: ", 
                    marker, value)
            } else {
                validIdJson[marker] = value
            }
        })
    return validIdJson
}

/**
 * Normalizes all json values so that every non-null value is a string. 
 */
export function normalizeIdentificationValues(idJson: Object): Object {
    if (!idJson) return null
    const normalized = {}
    Object.entries(idJson)
        .forEach( ([marker, value]) => {
            if (value === null) {
                normalized[marker] = null
            } else if (Array.isArray(value)) {
                normalized[marker] = value.map(v => v.toString())
            } else {
                normalized[marker] = value.toString()
            }
    })
    return normalized
}

export function identificationToSlate(idJson: Object): Array<HasType> {
    const idHeader = (tag, content) => {
        return transformToSlate({
            "tag": tag,
            "content": content
        })
    }
    return Object.entries(idJson)
        //@ts-ignore
        .flatMap( ([marker, value]) => (
            Array.isArray(value)
                ? value.map(text => idHeader(marker, text))
                : idHeader(marker, value)
        ))
}

export function parseIdentificationFromUsfm(usfm: string): Object {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    const headersArray: IdHeader[] = usfmJsDoc.headers
        .map(h => ({
            marker: h.tag,
            content: h.content
        }))
    return arrayToJson(headersArray)
}

export function parseIdentificationFromSlateTree(editor: Editor): Object {
    const headersArray: IdHeader[] = editor.children[0].children 
        .map(node => ({
            marker: node.type,
            content: Node.string(node)
        }))
    return arrayToJson(headersArray)
}

const isValidIdentificationMarker = (marker: string): boolean =>
    UsfmMarkers.isIdentification(marker) &&
    UsfmMarkers.isValid(marker)

const isNumberOrString = (value: any) =>
    typeof value === "string" ||
    typeof value === "number"

function isValidMarkerValuePair(marker: string, value: any): boolean {
    if (value === null) return true
    const baseMarker = UsfmMarkers.getBaseMarker(marker)
    if (baseMarker === UsfmMarkers.IDENTIFICATION.rem) {
        return Array.isArray(value) &&
            value.length > 0 &&
            value.every(v => isNumberOrString(v))
    } else {
        return isNumberOrString(value) 
    }
}

interface HasType {
    type: string
}

interface IdHeader {
    marker: string,
    content: string
}

function arrayToJson(headersArray: IdHeader[]): Object {
    const parsed = {}
    let remarks = []

    headersArray
        .forEach((h: IdHeader) => {
            if (h.marker == UsfmMarkers.IDENTIFICATION.rem) {
                remarks = remarks.concat(h.content)
            } else if (UsfmMarkers.isIdentification(h.marker)) {
                parsed[h.marker] = h.content
            }
        })
    if (remarks.length > 0) {
        parsed[UsfmMarkers.IDENTIFICATION.rem] = remarks
    }
    return parsed
}