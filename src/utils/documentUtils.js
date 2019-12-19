import {Document} from "slate"

/**
 * Uses document.getPreviousSibling, which does NOT move up the tree to the previous
 * answer if no sibling is found 
 * @param {Document} document
 */
export function getPreviousSiblingMatchingPredicate(document, node, predicate) {
    let current = node
    do {
        current = document.getPreviousSibling(current.key)
    }
    while (current && !predicate(current))

    return current
}

export function getPreviousInlineSibling(document, node) {
    return getPreviousSiblingMatchingPredicate(document, node, nodeIsInline)
}

/**
 * Uses document.getPreviousNode, which moves up the tree to the previous ancestor
 * if no sibling was found
 */
export function getPreviousNodeMatchingPredicate(document, node, predicate) {
    let current = node
    do {
        current = document.getPreviousNode(current.key)
    }
    while (current && !predicate(current))

    return current
}

/**
 * Finds the previous inline node to the the node passed in as a parameter.
 * This function can return a null value if there is no such node.
 */
export function getPreviousInlineNode(document, node) {
    return getPreviousNodeMatchingPredicate(document, node, nodeIsInline)
}

function nodeIsInline(node) {
    return node.object == "inline"
}

export function getAncestor(generations, node, document) {
    const nodePath = document.getPath(node.key);
    return getAncestorFromPath(generations, nodePath, document);
}

export function getAncestorFromPath(generations, path, document) {
    const ancestorPath = (generations > 0) ? path.slice(0, 0 - generations) : path;
    return ancestorPath.size ? document.getNode(ancestorPath) : null;
}