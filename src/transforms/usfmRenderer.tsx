import * as React from "react";
import { Node } from "slate";
import { VerseNumberWithVerseMenu } from "../components/VerseNumber"
import { UsfmMarkers }from "../utils/UsfmMarkers";
import NodeTypes from "../utils/NodeTypes";

export function renderLeafByProps(props) {
    const type =
        props.leaf[UsfmMarkers.SPECIAL_TEXT.bk]
            ? "cite"
            : "span"

    const className =
        props.leaf[UsfmMarkers.SPECIAL_TEXT.nd]
            ? "NomenDomini"
            : ""

    return React.createElement(
        type,
        { className: className, ...props.attributes },
        props.children
    )
}

export function renderElementByType(props) {
    switch (props.element.type) {
        case NodeTypes.CHAPTER:
            return <Chapter {...props} />
        case NodeTypes.HEADERS:
            return <SimpleDiv {...props} />
        case NodeTypes.INLINE_CONTAINER:
            return <InlineContainer {...props} />
        case NodeTypes.VERSE:
            return <SimpleSpan {...props} />
        case UsfmMarkers.CHAPTERS_AND_VERSES.c:
            return <ChapterNumber {...props} />
        case UsfmMarkers.CHAPTERS_AND_VERSES.v:
            return <VerseNumberWithVerseMenu {...props} />
        default:
            // This element is derived from a Usfm Marker
            const { baseMarker } = UsfmMarkers.destructureMarker(props.element.type)
            switch (baseMarker) {
                case 's':
                    return <SectionHeader {...props} />
                default:
                    if (isRenderedParagraphMarker(props.element.type)) {
                        // Both supported and unsupported paragraph markers will
                        // be rendered like a normal paragraph.
                        return <Paragraph {...props} />
                    }
            }
    }
}

export function numberClassNames(node) {
    if (Node.string(node) === "front") return "Front";
    return "";
}

function isRenderedParagraphMarker(marker: string): boolean {
    const { baseMarker } = UsfmMarkers.destructureMarker(marker)
    return UsfmMarkers.isParagraphType(marker) &&
        // @ts-ignore
        ! unrenderedParagraphMarkers.includes(baseMarker)
}

// Special paragraph markers that will not be visibly rendered but will
// exist in the slate dom.
const unrenderedParagraphMarkers: Array<string> =
    Object.values(UsfmMarkers.IDENTIFICATION)

const Chapter = props => {
    return <div 
        {...props.attributes}
        className="Chapter"
    >
        {props.children}
    </div>
}

const Paragraph = props => {
    return ( 
        <React.Fragment>
            <br className="ParagraphBreak" />
            <span {...props.attributes} className="p-usfm">
                {props.children}
            </span>
        </React.Fragment>
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
    const { number } = UsfmMarkers.destructureMarker(props.element.type);
    if (parseInt(number) == 5 && Node.string(props.element).trim() === "") {
        // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
        return (
            <span contentEditable={false} 
                className="HideFollowingLineBreak"
            >
                <hr {...props.attributes} />
                {props.children}
            </span>
        )
    } else {
        const HeadingTag = `h${number || 3}`;
        return (
            <HeadingTag className="HideFollowingLineBreak" {...props.attributes}>
                {props.children}
            </HeadingTag>
        );
    }
}