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
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} oldValueTree
 * @return {{isDirty: boolean}}
 */
export function handleOperation(sourceMap, op, oldValueTree) {
    let isDirty = false;
    switch (op.type) {
        case 'add_mark':
        case 'remove_mark':
        case 'set_mark':
        case 'set_selection':
            break;

        case 'insert_text':
        case 'remove_text':
            handleTextOperation(sourceMap, op, oldValueTree);
            isDirty = true;
            break;

        case 'remove_node':
            handleRemoveOperation(sourceMap, op, oldValueTree);
            isDirty = true;
            break;

        case 'merge_node':
            handleMergeOperation(sourceMap, op, oldValueTree);
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
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} value
 */
function handleRemoveOperation(sourceMap, op, value) {
    const {type, path, node, data} = op;
    console.info(type, op.toJS());
    // debugFamilyTree(node, value.document);
    const isTrivial = node.object === "text" && !node.text;
    const parent = value.document.getClosest(node.key, n => n.data && n.data.has("source"));
    const nodeSource = getSource(node, sourceMap);
    const parentSource = getSource(parent, sourceMap);

    if (!(parent && nodeSource && parentSource)) {
        if (isTrivial) {
            console.debug("Skipping trivial remove request.")
            return;
        } else {
            err("Could not find parent node for deletion.");
        }
    }

    console.info("Remove node", node && node.toJS());
    console.info("Remove from parent", parent && parent.toJS());
    removeJsonNode(nodeSource, parentSource);
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} value
 */
function handleMergeOperation(sourceMap, op, value) {
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
    console.debug("removeJsonNode node", node);
    console.debug("removeJsonNode parent", parent);

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

    if (parent.verseObjects) {
        removeJsonNode(node, parent.verseObjects)
    }

    err("Could not delete source node from source parent.");
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} value
 */
function handleTextOperation(sourceMap, op, value) {
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
    return ancestorPath.size ? document.getNode(ancestorPath) : null;
}

function debugFamilyTree(node, document) {
    console.debug("Family Tree", document.getAncestors(node.key).toJS());
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
    return {node, source, field};
}

function getSource(node, sourceMap) {
    const sourceKey = (node && node.data) ? node.data.get("source") : undefined;
    return sourceMap.get(sourceKey);
}

function nodeHasSourceText(node) {
    return node.data && node.data.has("source") && node.data.has("sourceTextField");
}

function err(message) {
    console.error(message);
    throw new Error(message);
}
