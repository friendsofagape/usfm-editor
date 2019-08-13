import {Operation, Value} from "slate";
import {chapterNumberName, verseNumberName} from "./numberTypes";

const ModificationTypeEnum = {
    "insert": 1,
    "remove": 2,

    /** @param {Operation} operation */
    of(operation) {
        return ModificationTypeEnum[operation.type.split("_")[0]];
    }
};

/**
 *
 * @param {Operation} op
 * @param {Value} value
 * @param {Map<number, Object>} sourceMap
 * @return {{isDirty: boolean}}
 */
export function handleOperation(op, value, sourceMap) {
    let isDirty = false;
    switch (op.type) {
        case 'add_mark':
        case 'remove_mark':
        case 'set_mark':
        case 'set_selection':
            break;

        case 'insert_text':
        case 'remove_text':
            handleTextOperation(op, value, sourceMap);
            isDirty = true;
            break;

        case 'insert_node':
        case 'merge_node':
        case 'move_node':
        case 'remove_node':
        case 'set_node':
        case 'split_node':
            isDirty = true;
            break;

        case 'set_value':
            isDirty = true;
            break;

        default:
            console.warn("Unknown operation", op.type);
    }
    return {isDirty};
}

/**
 * @param {Operation} op
 * @param {Value} value
 * @param {Map<number, Object>} sourceMap
 */
function handleTextOperation(op, value, sourceMap) {
    console.debug(op.type, op);
    const {node, source, field} = getTextNodeAndSource(value, op.path, sourceMap);
    if (!source || !field) {
        console.debug("Could not find source/sourceField for node.", node);
        throw new Error("Could not find source for node.");
    }

    console.debug("Editing node", node.toJS());
    console.debug("Editing source", source);

    const sourceText = source[field];
    let updatedText;
    switch (ModificationTypeEnum.of(op)) {
        case ModificationTypeEnum.insert:
            updatedText = sourceText.slice(0, op.offset) + op.text + sourceText.slice(op.offset);
            break;
        case ModificationTypeEnum.remove:
            updatedText = sourceText.slice(0, op.offset) + sourceText.slice(op.offset + op.text.length);
            break;
        default:
            console.warn("Unexpected operation", op.type);
    }

    if (typeof updatedText !== 'undefined') {
        source[field] = updatedText;

        console.debug("field", field);
        if (field === chapterNumberName || field === verseNumberName) {
            const collectionType = field === chapterNumberName ? "book" : "chapter";
            const collectionNode = value.document.getClosest(op.path, n => n.type === collectionType);
            // console.debug("collectionNode", collectionNode.toJS());
            const collectionSource = getSource(collectionNode, sourceMap);
            // console.debug("collectionSource", collectionSource);
            collectionSource[updatedText] = collectionSource[sourceText];
            delete collectionSource[sourceText]
        }
    }
}

// function getAncestor(generations, node, document) {
//     const nodePath = document.getPath(node.key);
//     const ancestorPath = (generations > 0) ? nodePath.slice(0, 0 - generations) : nodePath;
//     return document.getNode(ancestorPath);
// }

/**
 * Search the Slate value tree for the closest node that has a text source object.
 * @param {Value} value
 * @param {List|String} path
 * @param {Map<number, Object>} sourceMap
 * @return {{node: *, field, source: *}} The Slate node, the source object, and the field name of the source's text
 */
function getTextNodeAndSource(value, path, sourceMap) {
    const node = value.document.getClosest(path, nodeHasSourceText);
    const source = getSource(node, sourceMap);
    const field = (node && node.data) ? node.data.get("sourceTextField") : undefined;
    // const sourceField = node.type === "contentWrapper" ? "content" : "text";
    return {node, source, field};
}

function getSource(node, sourceMap) {
    const sourceKey = (node && node.data) ? node.data.get("source") : undefined;
    return sourceMap.get(sourceKey);
}

function nodeHasSourceText(node) {
    return node.data && node.data.has("source") && node.data.has("sourceTextField");
}
