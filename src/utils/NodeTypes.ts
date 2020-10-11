/**
 * These node types are types that can appear in the "type" field of a slate node 
 * but are NOT usfm markers.
 */
const NodeTypes = {
    CHAPTER: "chapter",
    VERSE: "verse",
    HEADERS: "headers",
    INLINE_CONTAINER: "inlineContainer", // Not from usfm-js
}
export default NodeTypes