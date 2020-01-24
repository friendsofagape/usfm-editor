import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import debounce from "debounce";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {SectionHeaderPlugin} from "./SectionHeaderPlugin"
import {changeWrapperType} from "./keyHandlers"
import {toUsfmJsonDocAndSlateJsonDoc} from "./jsonTransforms/usfmToSlate";
import {handleOperation} from "./operationHandlers";
import Schema from "./schema";
import {verseNumberName} from "./numberTypes";
import {HoverMenu} from "../hoveringMenu/HoveringMenu"
import {handleKeyPress} from "./keyHandlers";
import {Normalize, isValidMergeAtPath} from "./normalizeNode";
import clonedeep from "lodash/cloneDeep";
import {nodeTypes, isNewlineNodeType} from "../utils/nodeTypes";

/**
 * A WYSIWYG editor component for USFM
 */
class UsfmEditor extends React.Component {
    static propTypes = {
        /**
         *  USFM contents to be edited. Updating this prop will NOT cause a rerender, so consider also setting
         *  a "key" prop to trigger changes.
         */
        usfmString: PropTypes.string,

        /** Additional SlateJS plugins to be passed to editor. */
        plugins: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

        /** Change notification. */
        onChange: PropTypes.func,
    };

    static deserialize(usfmString) {
        // Return empty values if no input.
        if (!usfmString) return {usfmJsDocument: {}, value: Value.create()};

        const {usfmJsDocument, slateDocument} = toUsfmJsonDocAndSlateJsonDoc(usfmString);
        const value = Value.fromJSON(slateDocument);
        console.debug("Deserialized USFM as Slate Value", value.toJS());

        return {usfmJsDocument, value};
    }

    menuRef = React.createRef()

    /**
     * On update, update the menu.
     */
    componentDidMount = () => {
        this.updateMenu()
    }

    componentDidUpdate = () => {
        this.updateMenu()
    }

    /**
     * Update the menu's absolute position.
     */
    updateMenu = () => {
        const menu = this.menuRef.current
        if (!menu) return

        const { value } = this.state
        const { fragment, selection } = value

        if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
            menu.removeAttribute('style')
            return
        }

        const native = window.getSelection()
        const range = native.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        menu.style.opacity = 1
        menu.style.top = `${rect.top + window.pageYOffset - menu.offsetHeight}px`

        menu.style.left = `${rect.left +
        window.pageXOffset -
        menu.offsetWidth / 2 +
        rect.width / 2}px`
    }

    render = () => {
        return (
            <Editor
                plugins={this.state.plugins}
                schema={this.state.schema.schema}
                value={this.state.value}
                readOnly={false}
                spellCheck={false}
                onChange={this.handleChange}
                renderEditor={this.renderEditor}
                onKeyDown={this.onKeyDown}
            />
        );
    };

    onKeyDown = (event, editor, next) => {
        handleKeyPress(event, editor, next)
    }

    handleChange = (change) => {
        console.info("handleChange", change);
        console.info("      handleChange operations", change.operations.toJS());
        let value = this.state.value;
        let firstInvalidMergeOp = null
        try {
            for (const op of change.operations) {
                // console.debug(op.type, op.toJS());

                correctSelectionIfOnVerseOrChapterNumber(op, value.document, this.editor)

                if (firstInvalidMergeOp != null &&
                    op.type != "insert_text") {
                    // After an invalid merge operation is found, the only operation known
                    // to be valid is an insert text operation. (We assume that the selection was
                    // expanded and the user typed a key other than just Backspace or Delete.)
                    continue
                }
                else if (isInvalidMergeOperation(op, value.document)) {
                    console.log("Cancelling invalid merge_node and subsequent merge operations")
                    firstInvalidMergeOp = op
                    continue
                }
                else if (op.type == "split_node" &&
                    op.properties.data.has("source")) {
                    // Data needs to be deep cloned so the new node doesn't have a pointer to the same source
                    op.properties.data = clonedeep(op.properties.data)
                    // By the time the following debug statement prints, the data will likely have changed
                    console.debug("Deep cloning data properties before split_node nested operation")
                }

                const newValue = op.apply(value);
                const {isDirty} = handleOperation(op, value, newValue);
                if (isDirty) {
                    this.scheduleOnChange();
                }

                value = newValue
            }
        } catch (e) {
            console.warn("Operation failed; cancelling remainder of change.");
        }
        this.setState({value: value, usfmJsDocument: this.state.usfmJsDocument});

        if (firstInvalidMergeOp != null) {
            // Need to handle this here since this.editor's value is now updated
            handleInvalidMergeOp(firstInvalidMergeOp, this.editor)
        }
    };

    scheduleOnChange = debounce(() => {
        console.debug("Serializing updated USFM", this.state.usfmJsDocument);
        const transformedUsfmJsDoc = applyPreserializationTransforms(this.state.usfmJsDocument)
        const serialized = usfmjs.toUSFM(transformedUsfmJsDoc)
        const withNewlines = serialized.replace(/([^\n])(\\[vps])/g, '$1\n$2');
        this.props.onChange(withNewlines);
    }, 1000);

    handlerHelpers = {
        findNextVerseNumber:
            () => this.state.value.document.getBlocksByType(verseNumberName).map(x => +x.text).max() + 1,
    };

    /** @type {{plugins, usfmJsDocument, value} */
    state = {
        plugins: (this.props.plugins || []).concat([UsfmRenderingPlugin(), SectionHeaderPlugin, Normalize()]),
        schema: new Schema(this.handlerHelpers),
        ...UsfmEditor.deserialize(this.props.usfmString)
    };

    /**
     * @param {Editor} editor
     */
    renderEditor = (props, editor, next) => {
        this.editor = editor
        const children = next()
        return (
        <React.Fragment>
            {children}
            <HoverMenu ref={this.menuRef} editor={editor} />
        </React.Fragment>
        )
    }
}

function applyPreserializationTransforms(usfmJsDocument) {
    const transformed = clonedeep(usfmJsDocument)
    addTrailingNewlineToSections(transformed)
    return transformed
}

function addTrailingNewlineToSections(object) {
    for (var x in object) {
        if (object.hasOwnProperty(x)) {
            let item = object[x]
            if (item.type == "section" && 
                item.content && 
                !item.content.endsWith("\n")) {
                    item.content = item.content + "\n"
            }
            else if (typeof item == 'object') {
                addTrailingNewlineToSections(item)
            }
        }
    }
}

function correctSelectionIfOnVerseOrChapterNumber(op, document, editor) {
    if (isSetSelectionOnVerseOrChapterNumber(op, document)) {
        correctSelectionForwardOrBackwards(op, document, editor)
    }
}

function isSetSelectionOnVerseOrChapterNumber(op, document) {
    if (op.type == "set_selection" &&
        op.newProperties.anchor &&
        op.newProperties.anchor.path) {

        const parent = document.getParent(op.newProperties.anchor.path)
        return parent.type == "verseNumber" ||
               parent.type == "chapterNumber"
    } else {
        return false
    }
}

function correctSelectionForwardOrBackwards(op, document, editor) {
    const {path} = op.newProperties.anchor
    const {offset} = path
    let direction = 0
    if (offset == 0) {
        const prevNode = document.getPreviousNode(point.path)
        direction = prevNode.type == "headers" ? 1 : -1
    } else {
        direction = 1
    }

    if (direction == -1) {
        console.debug("Correcting selection backwards")
        editor.moveToEndOfPreviousText()
    } else if (direction == 1) {
        console.debug("Correcting selection forwards")
        editor.moveToStartOfNextText()
    }
}

function isInvalidMergeOperation(op, document) {
    return op.type == "merge_node" && 
        !isValidMergeAtPath(document, op.path)
}

function handleInvalidMergeOp(op, editor) {
    // If a merge operation failed on a newline node, we still need to replace
    //  the newline node with a textWrapper so the line break goes away
    let node = editor.value.document.getNode(op.path)
    if (node.has("type") &&
        isNewlineNodeType(node.type)) {
        changeWrapperType(editor, node, nodeTypes.TEXTWRAPPER)
    }

    // The selection may appear to be collapsed but it may still span two nodes
    console.log("Collapsing selection")
    editor.moveToAnchor()
}

export default UsfmEditor;