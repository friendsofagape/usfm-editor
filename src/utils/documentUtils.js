import {Document} from "slate"

export function getFurthestNonVerseInline(document, node) {
    return document.getFurthest(node.key, n => 
        n.object == "inline" && 
        n.type != "verseBody" && 
        n.type != "verse")
}

/**
 * Uses document.getPreviousSibling, which does NOT move up the tree to the previous
 * answer if no sibling is found 
 * @param {Document} document
 */
export function getPreviousSiblingMatchingPredicate(document, node, predicate) {
    var prev = document.getPreviousSibling(node.key)
    if (!prev || predicate(prev)) {
        return prev
    } else {
        return getPreviousSiblingMatchingPredicate(document, prev, predicate)
    }
}

export function getPreviousInlineSibling(document, node) {
    return getPreviousSiblingMatchingPredicate(document, node, nodeIsInline)
}

/**
 * Uses document.getPreviousNode, which moves up the tree to the previous ancestor
 * if no sibling was found
 */
export function getPreviousNodeMatchingPredicate(document, node, predicate) {
    var prev = document.getPreviousNode(node.key)
    if (!prev || predicate(prev)) {
        return prev
    } else {
        return getPreviousNodeMatchingPredicate(document, prev, predicate)
    }
}

export function getPreviousInlineNode(document, node) {
    const prevInline = getPreviousNodeMatchingPredicate(document, node, nodeIsInline)
    if (prevInline.type == "verse") {
        const descendants = prevInline.filterDescendants(nodeIsInline)
        return descendants.last()
    } else {
        return prevInline
    }
}

function nodeIsInline(node) {
    return node.object && node.object == "inline"
}

export function getAncestor(generations, node, document) {
    const nodePath = document.getPath(node.key);
    return getAncestorFromPath(generations, nodePath, document);
}

export function getAncestorFromPath(generations, path, document) {
    const ancestorPath = (generations > 0) ? path.slice(0, 0 - generations) : path;
    return ancestorPath.size ? document.getNode(ancestorPath) : null;
}
