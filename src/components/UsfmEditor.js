import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import debounce from "debounce";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {SectionHeaderPlugin} from "./SectionHeaderPlugin"
import {toUsfmJsonDocAndSlateJsonDoc} from "./jsonTransforms/usfmToSlate";
import {handleOperation} from "./operationHandlers";
import Schema from "./schema";
import {verseNumberName} from "./numberTypes";
import {HoverMenu} from "../hoveringMenu/HoveringMenu"
import {handleKeyPress} from "./keyHandlers";
import {Normalize} from "./normalizeNode";
import clonedeep from "lodash/cloneDeep";

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
        let shouldCollapseSelection = false
        try {
            for (const op of change.operations) {
                // console.debug(op.type, op.toJS());

                if (isNestedSplit(op)) {
                    // Data needs to be deep cloned so the new node doesn't have a pointer to the same source
                    op.properties.data = clonedeep(op.properties.data)
                    // By the time the following debug statement prints, the data will likely have changed
                    console.debug("Deep cloning data properties before split_node nested operation")
                }

                correctSelectionIfOnVerseOrChapterNumber(op, value.document, this.editor)

                if (op.type == "merge_node") {
                    console.log("Cancelling merge_node and subsequent operations")
                    shouldCollapseSelection = true
                    break
                }

                const newValue = op.apply(value);
                const {isDirty} = handleOperation(op, value, newValue, this.state.initialized);
                if (isDirty) {
                    this.scheduleOnChange();
                }

                value = newValue
            }
        } catch (e) {
            console.warn("Operation failed; cancelling remainder of change.");
        }
        this.setState({value: value, usfmJsDocument: this.state.usfmJsDocument, initialized: true});

        if (shouldCollapseSelection) {
            console.log("Collapsing selection")
            this.editor.moveToAnchor()
        }
    };

    scheduleOnChange = debounce(() => {
        console.debug("Serializing updated USFM", this.state.usfmJsDocument);
        const transformedUsfmJsDoc = applyPreserializationTransforms(this.state.usfmJsDocument)
        const serialized = usfmjs.toUSFM(transformedUsfmJsDoc);
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
        ...UsfmEditor.deserialize(this.props.usfmString),
        initialized: false
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

function isNestedSplit(op) {
    return op.type == "split_node" && op.target
}

function applyPreserializationTransforms(usfmJsDocument) {
    const transformed = clonedeep(usfmJsDocument)
    addTrailingNewLineToSections(transformed)
    return transformed
}

function addTrailingNewLineToSections(object) {
    for (var x in object) {
        if (object.hasOwnProperty(x)) {
            let item = object[x]
            if (item.type == "section" && !item.content.endsWith("\n")) {
                item.content = item.content + "\n"
            }
            else if (typeof item == 'object') {
                addTrailingNewLineToSections(item)
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

export default UsfmEditor;