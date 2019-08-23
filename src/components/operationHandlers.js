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

        case 'remove_node':
            handleRemoveOperation(op, value, sourceMap);
            isDirty = true;
            break;

        case 'merge_node':
            handleMergeOperation(op, value, sourceMap);
            isDirty = true;
            break;

        case 'insert_node':
        case 'move_node':
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
function handleRemoveOperation(op, value, sourceMap) {
    const {type, path, node, data} = op;
    console.debug(type, op.toJS());

    const parent = value.document.getClosest(node.path, n => getSource(n, sourceMap));

    const nodeSource = getSource(node, sourceMap);
    const parentSource = getSource(parent, sourceMap);

    console.debug("Remove node", node && node.toJS());
    console.debug("Remove from parent", parent && parent.toJS());
    // console.debug("Remove source", nodeSource);
    // console.debug("Remove parent source", parentSource);
    removeJsonNode(nodeSource, parentSource);
}

/**
 * @param {Operation} op
 * @param {Value} value
 * @param {Map<number, Object>} sourceMap
 */
function handleMergeOperation(op, value, sourceMap) {
    const {type, path, position, properties, data} = op;
    console.debug(type, op);
    const node = value.document.getNode(path);
    const prev = value.document.getPreviousSibling(node.path);

    const nodeSource = getSource(node, sourceMap);
    const prevSource = getSource(prev, sourceMap);

    console.debug("Merge node", node && node.toJS());
    console.debug("Merge prev", prev && prev.toJS());
    console.debug("Merge source", nodeSource);
    console.debug("Merge prev source", prevSource);
}

function removeJsonNode(node, parent) {
    if (Array.isArray(parent)) {
        const i = parent.indexOf(node);
        if (i < 0) throw new Error("Could not delete array node.");
        delete parent[i];
        return;
    }

    for (const k in parent) {
        if (parent.hasOwnProperty(k) && parent[k] == node) {
            delete parent[k];
            return;
        }
    }

    throw new Error("Could not delete node from unknown parent.");
}

/**
 * @param {Operation} op
 * @param {Value} value
 * @param {Map<number, Object>} sourceMap
 */
function handleTextOperation(op, value, sourceMap) {
    console.debug(op.type, op.toJS());
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

function getAncestor(generations, node, document) {
    const nodePath = document.getPath(node.key);
    const ancestorPath = (generations > 0) ? nodePath.slice(0, 0 - generations) : nodePath;
    return document.getNode(ancestorPath);
}

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
