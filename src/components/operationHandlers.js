import {Operation, Value} from "slate";
import {chapterNumberName, verseNumberName} from "./numberTypes";
import {getAncestorFromPath, getPreviousSiblingMatchingPredicate} from "../utils/documentUtils";

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
export function handleOperation(op, oldValueTree, newValueTree, initialized) {
    let isDirty = false;
    switch (op.type) {
        case 'add_mark':
        case 'remove_mark':
        case 'set_mark':
        case 'set_selection':
            break;

        case 'insert_text':
        case 'remove_text':
            handleTextOperation(op, oldValueTree);
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
            handleInsertOperation(op, newValueTree, initialized)
            isDirty = true;
            break;

        case 'move_node':
            handleMoveOperation(op, oldValueTree, newValueTree)
            isDirty = true;
            break;

        case 'set_node':
            isDirty = true;
            break;

        case 'split_node':
            handleSplitOperation(op, newValueTree)
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
    removeSourceFromTree(node, value)
}

function insertSourceIntoTree(slateInsertPath, value) {
    const node = value.document.getNode(slateInsertPath)
    const parent = getParentWithSource(value, node)
    const nodeSource = getSource(node)
    const parentSource = getSource(parent)

    const previousSiblingNode = getPreviousSiblingMatchingPredicate(value.document, node, nodeHasSource)
    if (!previousSiblingNode) { 
        console.debug("     Could not find previous sibling node") 
    }
    const previousSiblingSource = previousSiblingNode ? getSource(previousSiblingNode) : undefined

    console.info("     Insert node", node && node.toJS())
    console.info("     Insert into parent", parent && parent.toJS())
    insertJsonNode(nodeSource, parentSource, previousSiblingSource)
}

function removeSourceFromTree(node, value, errorOnFail = true) {
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

    console.info("     Remove node", node && node.toJS());
    console.info("     Remove from parent", parent && parent.toJS());
    removeJsonNode(nodeSource, parentSource, errorOnFail);
}

function insertJsonNode(node, parent, previousSiblingNode) {
    console.debug("     insertJsonNode node", node);
    console.debug("     insertJsonNode parent", parent);
    console.debug("     insertJsonNode previousSiblingNode", previousSiblingNode);

    let childContainer = parent.verseObjects || parent.children
    if (!childContainer && Array.isArray(parent)) {
        childContainer = parent
    }

    const prevSiblingIdx = previousSiblingNode ? childContainer.indexOf(previousSiblingNode) : -1
    childContainer.splice(prevSiblingIdx + 1, 0, node)
}

function removeJsonNode(node, parent, errorOnFail) {
    console.debug("     removeJsonNode node", node);
    console.debug("     removeJsonNode parent", parent);

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

    if (errorOnFail) {
        err("Could not delete source node from source parent.");
    } else {
        console.debug("     Remove failed- Did not find node in parent")
    }
}

/**
 * @param {Operation} op
 * @param {Value} value
 */
function handleMergeOperation(op, value) {
    // const {type, path, position, properties, data} = op;
    console.debug(op.type, op);
    // const node = value.document.getNode(path);
    // const prev = value.document.getPreviousSibling(node.path);

    // const nodeSource = getSource(node);
    // const prevSource = getSource(prev);

    // console.debug("Merge node", node && node.toJS());
    // console.debug("Merge prev", prev && prev.toJS());
    // console.debug("Merge source", nodeSource);
    // console.debug("Merge prev source", prevSource);

    const node = value.document.getNode(op.path)
    const prev = value.document.getPreviousNode(op.path)
    if (isEmptyText(node) && isEmptyText(prev)) {
        console.debug("     Merging two adjacent empty text nodes")
    } else {
        err("Merge not implemented")
    }
}

function isEmptyText(node) {
    return node.has("text") && !node.text.trim()
}

/**
 * @param {Operation} op
 * @param {Value} oldValue
 * @param {Value} newValue
 */
function handleMoveOperation(op, oldValue, newValue) {
    console.debug(op.type, op.toJS());
    // If the move is a result of noramlization, it is likely that the
    //   source does not exist in the tree yet, so pass 'false' to errorOnFail
    removeSourceFromTree(oldValue.document.getNode(op.path), oldValue, false)
    insertSourceIntoTree(op.newPath, newValue);
}

/**
 * @param {Operation} op
 * @param {Value} newValue
 */
function handleInsertOperation(op, newValue, initialized) {
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
 * This handler simply updates the wrapper node's source to match the child text node at index 0 
 * (There should only be one child text node, but there can be multiple children before normalization.)
 * 
 * The following is an example of when this handler is called.....
 * Action: user selects 'im' in 'animal' like 'an|im|al' and creates a section header
 * 1. remove_text is fired to remove 'im' ('im' is also removed from source)
 * 2. split_text automatically removes 'al', but the source is not updated since it was not a remove_text
 * 3. split_text inserts another text node for 'al' after 'an' and the 'im' header, within the same wrapper.
 *    (this new text node will be moved out of the wrapper during normalization. We do not try to insert the
 *     source into the tree, and when it is moved out of the wrapper via remove_node, the source is not affected.)
 * Requirement: The original text wrapper now needs its source to match its text ('an')
 */
function handleSplitOperation(op, newValue) {
    console.debug(op.type, op.toJS());

    const {node, source, field} = getTextNodeAndSource(newValue, op.path); // node is a wrapper
    if (node && source && field) {
        console.info("     Splitting node", node.toJS());
        console.info("     Updating source from", source);

        const basicTextNode = newValue.document.getNode(op.path)
        if (basicTextNode != node.nodes.get(0)) {
            console.warn("Updated text node is not at index 0 in the wrapper")
        }
        source[field] = basicTextNode.text

        console.info("     Updated source: ", source);
    }
}

/**
 * @param {Operation} op
 * @param {Value} value
 */
function handleTextOperation(op, value) {
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
    const field = getSourceTextField(node)
    return {node, source, field};
}

function getParentWithSource(value, node) {
     return value.document.getClosest(node.key, n => n.data && n.data.has("source"));
}

function err(message) {
    console.error(message);
    throw new Error(message);
}

function nodeHasSourceText(node) {
    return nodeHasSource(node) && node.data.has("sourceTextField");
}

function nodeHasSource(node) {
    return node.data && node.data.has("source")
}

function getSource(node) {
    return (node && node.data) ? node.data.get("source") : undefined;
}

function getSourceTextField(node) {
    return (node && node.data) ? node.data.get("sourceTextField") : undefined;
}