import {Operation, Value} from "slate";

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
 * @param op {Operation}
 * @param value {Value}
 * @param sourceMap {Map<number, Object>}
 */
function handleTextOperation(op, value, sourceMap) {
    console.debug(op.type, op);
    const node = value.document.getClosest(op.path, getSourceKey);
    const sourceKey = getSourceKey(node);
    const source = sourceMap.get(sourceKey);
    if (!source) {
        console.debug("Could not find source for node.", node);
        throw new Error("Could not find source for node.");
    }

    const sourceField = node.type === "contentWrapper" ? "content" : "text";
    const sourceText = source[sourceField];
    switch (ModificationTypeEnum.of(op)) {
        case ModificationTypeEnum.insert:
            source[sourceField] = sourceText.slice(0, op.offset) + op.text + sourceText.slice(op.offset);
            break;
        case ModificationTypeEnum.remove:
            source[sourceField] = sourceText.slice(0, op.offset) + sourceText.slice(op.offset + op.text.length);
            break;
        default:
            console.warn("Unexpected operation", op.type);
    }
}

function getSourceKey(node) {
    return node.data ? node.data.get("source") : undefined;
}
