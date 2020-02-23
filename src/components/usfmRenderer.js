import * as React from "react";
import "./UsfmEditor.css";
import { Node } from "slate";

export function renderLeafByProps(props) {
    const type = props.leaf["bk"] || props.leaf["+bk"] ?
        "cite" : "span"

    const className = props.leaf["nd"] || props.leaf["+nd"] ?
        "NomenDomini" : ""
    
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
            return <Chapter {...props} />
        case 'verse':
            return <Verse {...props} />
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
    }
}

const Paragraph = props => {
    return <span {...props.attributes}><br className="ParagraphBreak"/>{props.children}</span>
}

const Chapter = props => {
    return <div {...props.attributes}>{props.children}</div>
}
const Verse = props => {
    return <span {...props.attributes}>{props.children}</span>
}

const BookId = props => {
    return <div {...props.attributes} className="BookId">{props.children}</div>
}

const ChapterNumber = props => {
    return (
        <h1 {...props.attributes} className={`ChapterNumber ${numberClassNames(props.element)}`}>
            {props.children}
        </h1>
    )
}

const VerseNumber = props => {
    return (
        <sup {...props.attributes} className={`VerseNumber ${numberClassNames(props.element)}`}>
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