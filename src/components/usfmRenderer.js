import * as React from "react";
import "./UsfmEditor.css";
import { Node } from "slate";
import { NodeTypes } from "../utils/NodeTypes";

export function renderLeafByProps(props) {
    const type = 
        props.leaf[NodeTypes.BK]
        ? "cite" 
        : "span"

    const className = 
        props.leaf[NodeTypes.ND]
        ? "NomenDomini" 
        : ""
    
    return React.createElement(
        type,
        {className: className, ...props.attributes},
        props.children
    )
}

export function renderElementByType(props) {
    const {baseType} = destructureNodeType(props.element)
    switch (baseType) {
        case 'inlineContainer':
            return <span {...props.attributes}>{props.children}</span>
        case 'p':
            return <Paragraph {...props} />
        case 'chapter':
            return <SimpleDiv {...props} />
        case 'verse':
            return <SimpleSpan {...props} />
        case 'id':
            return <BookId {...props} />
        case 'chapterNumber':
            return <ChapterNumber {...props} />
        case 'verseNumber':
            return <VerseNumber {...props} />
        case 'front': // Front faux verse number
            return <Front {...props} />
        case 's':
            return <SectionHeader {...props} />
        case 'headers':
            return <SimpleDiv {...props} />
    }
}

const Paragraph = props => {
    return <span {...props.attributes}><br className="ParagraphBreak"/>{props.children}</span>
}

const SimpleDiv = props => {
    return <div {...props.attributes}>{props.children}</div>
}
const SimpleSpan = props => {
    return <span {...props.attributes}>{props.children}</span>
}

const BookId = props => {
    return <div {...props.attributes} className="BookId">{props.children}</div>
}

const ChapterNumber = props => {
    return (
        <h1 {...props.attributes} contentEditable={false} className={`ChapterNumber ${numberClassNames(props.element)}`}>
            {props.children}
        </h1>
    )
}

const VerseNumber = props => {
    return (
        <sup {...props.attributes} contentEditable={false} className={`VerseNumber ${numberClassNames(props.element)}`}>
            {props.children}
        </sup>
    )
}

const Front = props => {
    return (
        <sup {...props.attributes} className={`VerseNumber Front`}>
            {props.children}
        </sup>
    )
}

const SectionHeader = props => {
    const {number} = destructureNodeType(props.element);
    if (number == 5 && Node.string(props.element).trim() === "") {
        // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
        return <hr className="HideFollowingLineBreak" {...props.attributes} />;
    } else {
        const HeadingTag = `h${number || 3}`;
        return <HeadingTag className="HideFollowingLineBreak" {...props.attributes}>{props.children}</HeadingTag>;
    }
}

function numberClassNames(node) {
    if (Node.string(node) === "front") return "Front";
    return "";
}

function destructureNodeType(node) {
    const [, pluses, baseType, number] = node.type.match(/^(\+*)(.*?)(\d*)$/);
    return {pluses, baseType, number};
}