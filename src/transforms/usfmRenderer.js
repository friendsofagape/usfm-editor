import * as React from "react";
import "../components/UsfmEditor.css";
import { Node } from "slate";
import { NodeTypes } from "../utils/NodeTypes";
import { MarkTypes } from "../utils/MarkTypes";
import { VerseNumberWithVerseMenu } from "../components/VerseNumber"

export function renderLeafByProps(props) {
    const type =
        props.leaf[MarkTypes.BK]
            ? "cite"
            : "span"

    const className =
        props.leaf[MarkTypes.ND]
            ? "NomenDomini"
            : ""

    return React.createElement(
        type,
        { className: className, ...props.attributes },
        props.children
    )
}

export function renderElementByType(props) {
    const { baseType } = NodeTypes.destructureType(props.element.type)
    switch (baseType) {
        case 'p':
            return <Paragraph {...props} />
        case 'chapter':
        case 'headers':
            return <SimpleDiv {...props} />
        case 'inlineContainer':
            return <InlineContainer {...props} />
        case 'verse':
            return <SimpleSpan {...props} />
        case 'chapterNumber':
            return <ChapterNumber {...props} />
        case 'verseNumber':
            return <VerseNumberWithVerseMenu {...props} />
        case 's':
            return <SectionHeader {...props} />
        default:
            if (NodeTypes.isRenderedParagraphMarker(baseType)) {
                // Unsupported paragraph marker, but at least
                // render it like a paragraph.
                return <Paragraph {...props} />
            }
    }
}

export function numberClassNames(node) {
    if (Node.string(node) === "front") return "Front";
    return "";
}

const Paragraph = props => {
    return ( 
        <span {...props.attributes}>
            <br className="ParagraphBreak" />
            {props.children}
        </span>
    )
}

const SimpleDiv = props => {
    return <div {...props.attributes}>{props.children}</div>
}
const SimpleSpan = props => {
    return <span {...props.attributes}>{props.children}</span>
}

const InlineContainer = props => {
    const cssClass = Node.string(props.element) === "" 
        ? "EmptyInlineContainer" 
        : ""
    return <span
        {...props.attributes}
        className={cssClass}
    >
        {props.children}
    </span>
}

const ChapterNumber = props => {
    return (
        <h1 {...props.attributes} 
            contentEditable={false} 
            className={`ChapterNumber ${numberClassNames(props.element)}`}
        >
            {props.children}
        </h1>
    )
}


const SectionHeader = props => {
    const { number } = NodeTypes.destructureType(props.element.type);
    if (number == 5 && Node.string(props.element).trim() === "") {
        // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
        return <hr className="HideFollowingLineBreak" {...props.attributes} />;
    } else {
        const HeadingTag = `h${number || 3}`;
        return (
            <HeadingTag className="HideFollowingLineBreak" {...props.attributes}>
                {props.children}
            </HeadingTag>
        );
    }
}