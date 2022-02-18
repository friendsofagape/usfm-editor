import * as React from "react"
import styles from "../style.module.css"

/**
 * The user's selection cannot be expanded through this zero-width space. This partially solves the
 * problem where the user double- or triple-clicks on a word, causing the selection to span through
 * a non-contentEditable node (like a verse number or chapter number.) This works well when the
 * SelectionSeparator is added directly after a verse/chapter number; the user's selection stays
 * to the RIGHT of the number (i.e. within the desired verse). However, empirical obersvation shows that
 * placing the SelectionSeparator directly before a verse/chapter number does NOT prevent the case where
 * the user double/triple clicks on a word in the preceding verse, and the selection expands through the
 * next verse's verse number.
 *
 * Furthermore, placing the SelectionSeparator at the end of a verse node or the last editable node
 * within a verse (such as an inlineContainer or a paragraph) causes the visible cursor to disappear
 * when the selection is at the end of that node.
 *
 * Therefore, it is currently only recommended to place the SelectionSeparator directly after a
 * non-contentEditable node (such as a verse/chapter number). The directionality of the user's intended
 * selection can be inferred from the fact that any selection through the non-contentEditable node must
 * have originated to the LEFT of that node.
 */
export const SelectionSeparator: React.FC = () => (
    <span // Zero-width space ensures that selection stays to the right of the verse number
        className={styles["no-select"]}
        contentEditable={false}
    >
        &#8203;
    </span>
)
