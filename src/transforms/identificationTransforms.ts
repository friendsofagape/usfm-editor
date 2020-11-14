import * as usfmjs from "usfm-js";
import { Node, Editor } from 'slate';
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { transformToSlate } from "./usfmToSlate";
import clonedeep from "lodash/cloneDeep"
import { IdentificationHeaders } from "../UsfmEditor";
import { TypedNode, isTypedNode } from "../utils/TypedNode";

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
    current: IdentificationHeaders,
    updates: IdentificationHeaders
): IdentificationHeaders {
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

export function filterInvalidIdentification(ids: IdentificationHeaders): IdentificationHeaders {
    const validIdJson = {}
    Object.entries(ids)
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
export function normalizeIdentificationValues(ids: IdentificationHeaders): IdentificationHeaders {
    if (!ids) return null
    const normalized = {}
    Object.entries(ids)
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

export function identificationToSlate(ids: IdentificationHeaders): Array<TypedNode> {
    function idHeader(tag, content): Array<TypedNode> {
        const nodes: Array<Node> = asArray(transformToSlate({ tag, content }))
        return nodes.flatMap(n => {
            if (isTypedNode(n)) {
                return [n as TypedNode]
            } else {
                console.error("type error", n)
                return []
            }
        })
    }

    function asArray<T>(x: T | T[]): T[] {
        return Array.isArray(x) ? x : [x]
    }

    const entries: Array<[string, string]> = Object.entries(ids)
        .flatMap( ([marker, vals]) =>
            asArray(vals).map<[string, string]>(v => [marker, v])
        )

    return entries.flatMap(([marker, value]) => idHeader(marker, value))
}

export function parseIdentificationFromUsfm(usfm: string): IdentificationHeaders {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    const headersArray: IdHeader[] = usfmJsDoc.headers
        .map(h => ({
            marker: h.tag,
            content: h.content
        }))
    return arrayToIds(headersArray)
}

export function parseIdentificationFromSlateTree(editor: Editor): IdentificationHeaders {
    const slateHeaders = (editor.children[0] && Array.isArray(editor.children[0].children))
        ? editor.children[0].children
        : []
    const headersArray: IdHeader[] = slateHeaders
        .map(node => ({
            marker: node.type,
            content: Node.string(node)
        }))
    return arrayToIds(headersArray)
}

const isValidIdentificationMarker = (marker: string): boolean =>
    UsfmMarkers.isIdentification(marker) &&
    UsfmMarkers.isValid(marker)

const isNumberOrString = (value: unknown) =>
    typeof value === "string" ||
    typeof value === "number"

function isValidMarkerValuePair(marker: string, value: unknown): boolean {
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

interface IdHeader {
    marker: string,
    content: string
}

function arrayToIds(headersArray: IdHeader[]): IdentificationHeaders {
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