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

export function getPreviousInlineNode(document, node) {
    const prevInline = getPreviousNodeMatchingPredicate(document, node, nodeIsInline)
    if (prevInline.type == "verse") {
        // Due to the nature of document.getPreviousNode, this will be the PREVIOUS verse
        // and not the ancestor verse.
        const descendants = prevInline.filterDescendants(nodeIsInline)
        return descendants.last()
    } else {
        return prevInline
    }
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

export function getHighestNonVerseInlineAncestor(document, node) {
    return document.getFurthest(node.key, n => 
        n.object == "inline" && 
        n.type != "verseBody" && 
        n.type != "verse")
}