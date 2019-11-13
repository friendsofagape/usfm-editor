export function nodeHasSourceText(node) {
    return nodeHasSource(node) && node.data.has("sourceTextField");
}

export function nodeHasSource(node) {
    return node.data && node.data.has("source")
}

export function getSource(node) {
    return (node && node.data) ? node.data.get("source") : undefined;
}

export function getSourceTextField(node) {
    return (node && node.data) ? node.data.get("sourceTextField") : undefined;
}