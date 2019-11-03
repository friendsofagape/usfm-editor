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
 * @param {Value} oldValueTree
 * @return {{isDirty: boolean}}
 */
export function handleOperation(op, oldValueTree, newValueTree, state, initialized, editor) {
    let isDirty = false;
    switch (op.type) {
        case 'add_mark':
        case 'remove_mark':
        case 'set_mark':
        case 'set_selection':
            break;

        case 'insert_text':
        case 'remove_text':
            handleTextOperation(op, oldValueTree, state);
            isDirty = true;
            break;

        case 'remove_node':
            handleRemoveOperation(op, oldValueTree);
            isDirty = true;
            break;

        case 'merge_node':
            handleMergeOperation(op, oldValueTree);
            isDirty = true;
            break;

        case 'insert_node':
            handleInsertOperation(op, oldValueTree, newValueTree, state, initialized)
            isDirty = true;
            break;

        case 'move_node':
            handleMoveOperation(op, oldValueTree, newValueTree, state)
            isDirty = true;
            break;

        case 'set_node':
            isDirty = true;
            break;

        case 'split_node':
            handleSplitOperation(op, oldValueTree)
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
 */
function handleRemoveOperation(op, value) {
    const {type, path, node, data} = op;
    console.info(type, op.toJS());
    // debugFamilyTree(node, value.document);
    const isTrivial = node.object === "text" && !node.text;
    const parent = getParentWithSource(value, node)
    const nodeSource = getSource(node);
    const parentSource = getSource(parent);

    if (!(parent && nodeSource && parentSource)) {
        if (isTrivial) {
            console.debug("     Skipping trivial remove request.")
            return;
        } else {
            console.debug("     Could not find parent node for deletion")
            return;
        }
    }

    console.info("Remove node", node && node.toJS());
    console.info("Remove from parent", parent && parent.toJS());
    removeJsonNode(nodeSource, parentSource);
}

/**
 * @param {Operation} op
 * @param {Value} value
 */
function handleMergeOperation(op, value) {
    // const {type, path, position, properties, data} = op;
    // console.debug(type, op);
    // const node = value.document.getNode(path);
    // const prev = value.document.getPreviousSibling(node.path);

    // const nodeSource = getSource(node);
    // const prevSource = getSource(prev);

    // console.debug("Merge node", node && node.toJS());
    // console.debug("Merge prev", prev && prev.toJS());
    // console.debug("Merge source", nodeSource);
    // console.debug("Merge prev source", prevSource);
    err("Merge not implemented")
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
 * @param {Operation} op
 * @param {Value} oldValue
 * @param {Value} newValue
 */
function handleMoveOperation(op, oldValue, newValue, state) {
    console.debug(op.type, op.toJS());
    insertSourceIntoTree(op.newPath, newValue);
}

/**
 * @param {Operation} op
 * @param {Value} oldValue
 * @param {Value} newValue
 */
function handleInsertOperation(op, oldValue, newValue, state, initialized) {
    if (op.node.text) {
        console.debug(op.type, op.toJS());
    }

    // If the parent is a text node, we are entering an invalid state.
    // Normalization will occur, so don't modify the source tree yet.
    const parentNode = getAncestorFromPath(1, op.path, newValue.document)
    if (nodeHasSourceText(parentNode)) {
        console.debug("     Trying to insert new node into text node, skipping source tree update")
        return;
    }

    if (initialized && nodeHasSource(op.node)) {
        insertSourceIntoTree(op.path, newValue)
    } 
}

/**
 * @param {Operation} op
 * @param {Value} value
 */
function handleSplitOperation(op, value) {
    console.debug("     selected text is: " + value.opText)
    console.debug(op.type, op.toJS());

    // If the position is 0, this isn't really a split.
    if (op.position > 0) {
        // Two nodes will result from this operation.
        // The original node's text will be modified so as not to contain the text of the new node.
        // However, this is done automatically and not through a remove_text operation, so we have to
        //      modify the source here.
        const {node, source, field} = getTextNodeAndSource(value, op.path);
        source[field] = source[field].substring(0, op.position) + "\r\n"
    }
}

/**
 * @param {Operation} op
 * @param {Value} value
 */
function handleTextOperation(op, value, state) {
    console.debug(op.type, op.toJS());
    const {node, source, field} = getTextNodeAndSource(value, op.path);
    if (!source || !field) {
        err("Could not find source/sourceField for node.");
    }

    console.debug("     Editing node", node.toJS());
    console.debug("     Editing source", source);

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
        console.debug("     field", field);

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
    const slateNode = value.document.getNode(slateInsertPath)
    const parentNode = getAncestorFromPath(1, slateInsertPath, value.document)
    const childContainer = getSourceChildContainer(value, parentNode)

    const previousSiblingNode = value.document.getPreviousSibling(slateInsertPath)
    var prevSiblingIdx = -1
    if (previousSiblingNode) {
        const previousSiblingSource = getSource(previousSiblingNode)
        prevSiblingIdx = childContainer.findIndex(obj => obj == previousSiblingSource)
    } else { console.debug("Could not find previous sibling node") }

    childContainer.splice(prevSiblingIdx + 1, 0, getSource(slateNode))
}

export function getAncestor(generations, node, document) {
    const nodePath = document.getPath(node.key);
    return getAncestorFromPath(generations, nodePath, document);
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
function getTextNodeAndSource(value, path) {
    const node = value.document.getClosest(path, nodeHasSourceText);
    const source = getSource(node);
    const field = (node && node.data) ? node.data.get("sourceTextField") : undefined;
    return {node, source, field};
}

function getParentWithSource(value, node) {
     return value.document.getClosest(node.key, n => n.data && n.data.has("source"));
}

function getSourceChildContainer(value, node) {
    const parent = getParentWithSource(value, node)
    const sourceParent = getSource(parent)
    return sourceParent.verseObjects || sourceParent.children
}

function getSource(node) {
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