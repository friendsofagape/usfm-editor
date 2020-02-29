import { Editor, Transforms, Path } from "slate";
import { NodeTypes } from "../utils/NodeTypes"
import { MyEditor } from "../utils/MyEditor"
import { jsx } from "slate-hyperscript";

export const withSectionHeaders = (editor: Editor) => {

    editor.insertOrRemoveSectionHeader = () => {
        if (MyEditor.areMultipleBlocksSelected(editor)) {
            console.log("Must select within one block to create a section header")
            return
        }
        const [selectedBlock, selectedBlockPath] = Editor.parent(editor, editor.selection.anchor.path)
        if (selectedBlock.type == NodeTypes.S) {
            removeSectionHeader(editor, selectedBlockPath)
        } else {
            insertSectionHeader(editor, selectedBlockPath)
        }
    }
    return editor
}

function removeSectionHeader(editor: Editor, blockPath: Path) {
    Transforms.mergeNodes(editor, { at: blockPath })
}

function insertSectionHeader(editor: Editor, blockPath: Path) {
    Transforms.wrapNodes(
        editor,
        jsx(
            'element',
            { type: NodeTypes.S },
            []
        ),
        { at: editor.selection, split: true }
    )
    // The text nodes in the new section header will still come wrapped
    // in a block of the original type, so we need to unwrap them so that
    // their parent is the section header block itself.
    const sectionHeaderPath = Path.next(blockPath)
    Transforms.unwrapNodes(
        editor,
        { at: sectionHeaderPath.concat(0) }
    )
    // Set the type of the block after the section header (if there is one)
    // to be a paragraph.
    const nextBlockEntry = Editor.next(editor, { at: sectionHeaderPath })
    if (nextBlockEntry) {
        Transforms.setNodes(
            editor, 
            { type: NodeTypes.P }, 
            { at: nextBlockEntry[1] }
        )
    }
}