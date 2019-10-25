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
export function handleOperation(sourceMap, op, oldValueTree, newValueTree, state, initialized) {
    let isDirty = false;
    switch (op.type) {
        case 'add_mark':
        case 'remove_mark':
        case 'set_mark':
        case 'set_selection':
            break;

        case 'insert_text':
        case 'remove_text':
            handleTextOperation(sourceMap, op, oldValueTree, state);
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
            handleInsertOperation(sourceMap, op, oldValueTree, newValueTree, state, initialized)
            isDirty = true;
            break;

        case 'move_node':
            handleMoveOperation(sourceMap, op, oldValueTree, newValueTree, state)
            isDirty = true;
            break;

        case 'set_node':
            isDirty = true;
            break;

        case 'split_node':
            handleSplitOperation(sourceMap, op, oldValueTree)
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
    const parent = getParentWithSourceLink(value, node)
    const nodeSource = getSource(node);
    const parentSource = getSource(parent);

    if (!(parent && nodeSource && parentSource)) {
        if (isTrivial) {
            console.debug("Skipping trivial remove request.")
            return;
        } else {
            console.debug("Could not find parent node for deletion")
            return;
            // err("Could not find parent node for deletion.");
            // If a second text node got added to a textWrapper, it will be deleted but
            //   there won't be a corresponding source
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

    const nodeSource = getSource(node);
    const prevSource = getSource(prev);

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

    const childContainer = parent.verseObjects || parent.children;
    if (childContainer) {
        const i = childContainer.indexOf(node);
        if (i < 0) {
            console.warn("Couldn't find child node for deletion", node);
            console.warn("...searched in", childContainer);
            throw new Error("Could not delete node from childContainer.");
        }
        childContainer.splice(i, 1);
        return;
    }

    err("Could not delete source node from source parent.");
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} oldValue
 * @param {Value} newValue
 */
function handleMoveOperation(sourceMap, op, oldValue, newValue, state) {
    console.debug(op.type, op.toJS());
    insertSourceIntoTree(op.newPath, newValue);
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} oldValue
 * @param {Value} newValue
 */
function handleInsertOperation(sourceMap, op, oldValue, newValue, state, initialized) {
    console.debug(op.type, op.toJS());

    // If the parent is a text node, we are entering an invalid state.
    // Normalization will occur, so don't modify the source tree yet.
    const parentNode = getAncestorFromPath(1, op.path, newValue.document)
    if (nodeHasSourceText(parentNode)) {
        console.debug("Trying to insert new node into text node, skipping source tree update")
        return;
    }

    if (initialized && nodeHasSource(op.node)) {
        insertSourceIntoTree(op.path, newValue)
    } 
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} value
 */
function handleSplitOperation(sourceMap, op, value) {
    console.debug("selected text is: " + value.opText)
    console.debug(op.type, op.toJS());
    const {node, source, field} = getTextNodeAndSource(value, op.path);

    source[field] = source[field].substring(0, op.position) + "\r\n"
}

/**
 * @param {Map<number, Object>} sourceMap
 * @param {Operation} op
 * @param {Value} value
 */
function handleTextOperation(sourceMap, op, value, state) {
    value.opText = op.text

    console.debug(op.type, op.toJS());
    const {node, source, field} = getTextNodeAndSource(value, op.path);
    if (!source || !field) {
        err("Could not find source/sourceField for node.");
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
        console.debug("field", field);

        if (field === chapterNumberName || field === verseNumberName) {
            const collectionType = field === chapterNumberName ? "book" : "chapter";
            const collectionNode = value.document.getClosest(op.path, n => n.type === collectionType);
            // console.debug("collectionNode", collectionNode.toJS());
            const collectionSource = getSource(collectionNode);
            // console.debug("collectionSource", collectionSource);
            if (collectionSource[updatedText]) {
                err("Attempt to create duplicate verse number.");
            }
            collectionSource[updatedText] = collectionSource[sourceText];
            delete collectionSource[sourceText]
        }

        source[field] = updatedText;
    }
}

function insertSourceIntoTree(slateInsertPath, value) {
    // TODO: If this came from a modeNode op, remove the source from where it was in the tree???
    // Or, we assume that we don't need to do this
    const slateNode = value.document.getNode(slateInsertPath)
    const parentNode = getAncestorFromPath(1, slateInsertPath, value.document)
    const sourceArray = getSourceParentArray(value, parentNode)

    // TODO: if getPreviousSibling returns nothing or doesn't have a source
    const previousSiblingNode = value.document.getPreviousSibling(slateInsertPath)
    const previousSiblingSource = getSource(previousSiblingNode)

    const prevSiblingIdx = sourceArray.findIndex(obj => obj == previousSiblingSource)
    sourceArray.splice(prevSiblingIdx + 1, 0, getSource(slateNode))
    console.log("hlloe")
}

export function getAncestor(generations, node, document) {
    const nodePath = document.getPath(node.key);
    const ancestorPath = (generations > 0) ? nodePath.slice(0, 0 - generations) : nodePath;
    return ancestorPath.size ? document.getNode(ancestorPath) : null;
}

function getAncestorFromPath(generations, path, document) {
    const ancestorPath = (generations > 0) ? path.slice(0, 0 - generations) : path;
    return ancestorPath.size ? document.getNode(ancestorPath) : null;
}

function debugFamilyTree(node, document) {
    console.debug("Family Tree", document.getAncestors(node.key).toJS());
}

/**
 * Search the Slate value tree for the closest node that has a text source object.
 * @param {Value} value
 * @param {List|String} path
 * @return {{node: *, field, source: *}} The Slate node, the source object, and the field name of the source's text
 */
export function getTextNodeAndSource(value, path) {
    const node = value.document.getClosest(path, nodeHasSourceText);
    const source = getSource(node);
    const field = (node && node.data) ? node.data.get("sourceTextField") : undefined;
    return {node, source, field};
}

function getParentWithSourceLink(value, node) {
     return value.document.getClosest(node.key, n => n.data && n.data.has("source"));
}

export function getSourceParentArray(value, node) {
    const parent = getParentWithSourceLink(value, node)
    const sourceParent = getSource(parent)
    return sourceParent.verseObjects || sourceParent.children
}

export function getSource(node) {
    return (node && node.data) ? node.data.get("source") : undefined;
}

function nodeHasSourceText(node) {
    return nodeHasSource(node) && node.data.has("sourceTextField");
}

function nodeHasSource(node) {
    return node.data && node.data.has("source")
}

function err(message) {
    console.error(message);
    throw new Error(message);
}