import React from "react";
import PropTypes from "prop-types"
import {Value} from "slate";
import {Editor} from "slate-react";
import debounce from "debounce";
import usfmjs from "usfm-js";
import "./UsfmEditor.css";
import {UsfmRenderingPlugin} from "./UsfmRenderingPlugin"
import {SectionHeaderPlugin} from "./SectionHeaderPlugin"
import {InsertParagraphPlugin} from "./keyHandlers"
import {toUsfmJsonDocAndSlateJsonDoc} from "./jsonTransforms/usfmToSlate";
import {handleOperation} from "./operationHandlers";
import Schema from "./schema";
import {verseNumberName} from "./numberTypes";
import {HoverMenu} from "../hoveringMenu/HoveringMenu"
import {handleKeyPress, correctSelection} from "./keyHandlers";
import {Normalize} from "./normalizeNode";
import { getAncestor, getPreviousInlineNode } from "../utils/documentUtils";
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
        try {
            for (const op of change.operations) {
                if (op.type == "split_node" && op.target) {
                    op.properties.data = clonedeep(op.properties.data)
                    // By the time the following debug statement prints, the data will likely have changed
                    console.debug("Deep cloning data properties before split_node nested operation")
                }
                // console.debug(op.type, op.toJS());
                // if (isSetSelectionAndAnchorPathDefined(op)) {

                //     if (isPathAtStartOfVerse(value.document, op.newProperties.anchor.path)) {
                //         console.log("!!!!!!!!!!!!!!!!!!! Moving to start of next text")
                //         this.editor.moveToStartOfNextText()
                //         continue
                //     } 
                //     else if (change.operations.size == 1) {
                //         const correctedNode = correctSelectionBackwards(value.document, op.newProperties.anchor)
                //         if (correctedNode) {
                //             console.log("!!!!!!!!!!!!!!!!!! Moving to end of a previous text")
                //             this.editor.moveToEndOfNode(correctedNode)
                //             continue
                //         }
                //     }
                // }

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
    };

    scheduleOnChange = debounce(() => {
        console.debug("Serializing updated USFM", this.state.usfmJsDocument);
        addTrailingNewLineToSections(this.state.usfmJsDocument)
        const serialized = usfmjs.toUSFM(this.state.usfmJsDocument);
        const withNewlines = serialized.replace(/(\\[vps])/g, '\r\n$1');
        this.props.onChange(withNewlines);
    }, 1000);

    handlerHelpers = {
        findNextVerseNumber:
            () => this.state.value.document.getInlinesByType(verseNumberName).map(x => +x.text).max() + 1,
    };

    /** @type {{plugins, usfmJsDocument, value} */
    state = {
        plugins: (this.props.plugins || []).concat([UsfmRenderingPlugin(), SectionHeaderPlugin, InsertParagraphPlugin, Normalize()]),
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

function correctSelectionBackwards(document, point) {
    // Maybe keep investigating why the lack of paragraph causes this to happen

    // Can use moveToEndOfPreviousInlineText in keyHandlers, maybe.

    // If the text node is an empty text and it is not the deepest text, it should be skipped

    // Look at wrapping/unwrapping?? Does /p really just need to be a block?? (And s?)

    const textNode = document.getNode(point.path)
    let current = textNode
    while (current && !current.text.trim() && point.offset == 0) {
        current = document.getPreviousText(current.key)
    }
    if (current && textNode != current) {
        return current
    } else {
        return null
    }
}

function isSetSelectionAndAnchorPathDefined(op) {
    return op.type == "set_selection" &&
        op.newProperties.anchor &&
        op.newProperties.anchor.path
} 

function isPathAtStartOfVerse(document, path) {
    const textNode = document.getNode(path)
    if (!textNode.has("text")) {
        console.warn("Selection is not a text node")
    }
    return isTextStandaloneEmptyText(document, textNode) &&
        getPreviousInlineNode(document, textNode) == null
}

function isTextStandaloneEmptyText(document, textNode) {
    const parent = getAncestor(1, textNode, document)
    return parent.object &&
        parent.object == "block" &&
        parent.type == "verseBody" &&
        !textNode.text.trim()
}

export default UsfmEditor;