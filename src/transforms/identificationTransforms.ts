import * as usfmjs from "usfm-js";
import { Node, Editor } from 'slate';
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { transformToSlate } from "./usfmToSlate";
import * as clonedeep from "lodash/cloneDeep"

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
) {
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

export function filterInvalidIdentification(idJson) {
    if (!idJson) return null
    const validIdJson = {}
    Object.entries(idJson)
        .forEach( ([marker, value]) => {
            if (UsfmMarkers.isIdentification(marker) &&
                UsfmMarkers.isMarkerNumberValid(marker)
            ) {
                validIdJson[marker] = value
            } else {
                console.error("Invalid marker: ", marker)
            }
        })
    return validIdJson
}

interface HasType {
    type: string
}

export function identificationToSlate(idJson): Array<HasType> {
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

export function parseIdentificationFromUsfm(usfm) {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    const headersArray: IdHeader[] = usfmJsDoc.headers
        .map(h => ({
            marker: h.tag,
            content: h.content
        }))
    return arrayToJson(headersArray)
}

export function parseIdentificationFromSlateTree(editor: Editor) {
    const headersArray: IdHeader[] = editor.children[0].children 
        .map(node => ({
            marker: node.type,
            content: Node.string(node)
        }))
    return arrayToJson(headersArray)
}

interface IdHeader {
    marker: string,
    content: string
}

function arrayToJson(headersArray: IdHeader[]) {
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