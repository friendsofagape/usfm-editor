import { Editor, Path } from 'slate'

export const MyEditor = {
    ...Editor,
    areMultipleBlocksSelected
}

function areMultipleBlocksSelected(editor: Editor) {
    const { selection } = editor
    const anchorParent = Path.parent(selection.anchor.path)
    const focusParent = Path.parent(selection.focus.path)
    return !Path.equals(anchorParent, focusParent)
}