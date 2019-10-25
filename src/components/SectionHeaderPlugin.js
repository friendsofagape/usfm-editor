import {getTextNodeAndSource, getSourceParentArray} from "./operationHandlers";
import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";

export const SectionHeaderPlugin = {
    commands: {
        createSectionHeader(editor) {
            const value = editor.value
            const headerUsfm = "\\s3 " + value.fragment.text
            const headerJson = toUsfmJsonNode(headerUsfm)
            headerJson.content = headerJson.content + "\r\n"

            // Find the json node that the user has selected
            const path = value.selection.focus.path
            const {node, source, field} = getTextNodeAndSource(value, path)

            // Find the parent of that json node 
            const sourceParentArray = getSourceParentArray(value, node)

            // Insert a header hode, as a new child of the parent, after the existing text node
            const index = sourceParentArray.findIndex(obj => obj == source) + 1
            sourceParentArray.splice(index, 0, headerJson)

            // Transform to slate json and insert the header into the Slate DOM
            const transformedHeader = toSlateJson(headerJson)
            editor.insertInline(transformedHeader) // causes remove_text, split_node, and insert_node to fire
        }
    }
}