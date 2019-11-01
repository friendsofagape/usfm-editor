import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";
import {Editor} from "slate-react";

export const SectionHeaderPlugin = {
    commands: {
        /**
         * @param {Editor} editor 
         */
        createSectionHeader(editor) {
            const value = editor.value
            const headerUsfm = "\\s3 " + value.fragment.text
            const headerJson = toUsfmJsonNode(headerUsfm)
            headerJson.content = headerJson.content + "\r\n"

            // Transform to slate json and insert the header into the Slate DOM
            const transformedHeader = toSlateJson(headerJson)
            editor.insertInline(transformedHeader) // causes remove_text, split_node, and insert_node to fire
        }
    }
}