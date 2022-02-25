import * as React from "react"
import { Node } from "slate"
import { VerseNumberWithVerseMenu } from "../components/VerseNumber"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import NodeTypes from "../utils/NodeTypes"
import { RenderElementProps, RenderLeafProps } from "slate-react"

export function renderLeafByProps(props: RenderLeafProps): JSX.Element {
    const type = props.leaf[UsfmMarkers.SPECIAL_TEXT.bk] ? "cite" : "span"

    let className = ""
    if (props.leaf[UsfmMarkers.SPECIAL_TEXT.nd])
        className = className + "usfm-marker-nd "
    if (props.leaf[UsfmMarkers.SPECIAL_TEXT.bk])
        className = className + "usfm-marker-bk "

    return React.createElement(
        type,
        { className: className.trim(), ...props.attributes },
        props.children
    )
}

export function renderElementByType(props: RenderElementProps): JSX.Element {
    switch (props.element.type) {
        case undefined:
        case null:
            return <UnrenderedMarker {...props} />
        case NodeTypes.CHAPTER:
            return <Chapter {...props} />
        case NodeTypes.HEADERS:
            return <Headers {...props} />
        case NodeTypes.INLINE_CONTAINER:
            return <InlineContainer {...props} />
        case NodeTypes.VERSE:
            return <Verse {...props} />
        case UsfmMarkers.CHAPTERS_AND_VERSES.c:
            return <ChapterNumber {...props} />
        case UsfmMarkers.CHAPTERS_AND_VERSES.v:
            return <VerseNumberWithVerseMenu {...props} />
        default:
            // This element is derived from a Usfm Marker
            const baseMarker = UsfmMarkers.destructureMarker(
                props.element.type
            )?.baseMarker
            switch (baseMarker) {
                case UsfmMarkers.TITLES_HEADINGS_LABELS.s:
                    return <SectionHeader {...props} />
                default:
                    if (isRenderedParagraphMarker(props.element.type)) {
                        // Both supported and unsupported paragraph markers will
                        // be rendered like a normal paragraph.
                        return (
                            <Paragraph
                                {...props}
                                cssClass={`usfm-marker-${baseMarker}`}
                            />
                        )
                    } else {
                        return <UnrenderedMarker {...props} />
                    }
            }
    }
}

const UnrenderedMarker = (props: RenderElementProps) => {
    return (
        <span {...props.attributes} className="usfm-editor-unrendered-marker">
            {props.children}
        </span>
    )
}

export function numberClassNames(node: Node): string {
    if (Node.string(node) === "front") return "usfm-editor-front"
    return ""
}

function isRenderedParagraphMarker(marker: string): boolean {
    const baseMarker = UsfmMarkers.destructureMarker(marker)?.baseMarker
    return (
        baseMarker !== undefined &&
        UsfmMarkers.isParagraphType(marker) &&
        !unrenderedParagraphMarkers.includes(baseMarker)
    )
}

// Special paragraph markers that will not be visibly rendered but will
// exist in the slate dom.
const unrenderedParagraphMarkers: Array<string> = Object.values(
    UsfmMarkers.IDENTIFICATION
)

const Chapter = (props: RenderElementProps) => {
    return (
        <div {...props.attributes} className="usfm-editor-chapter">
            {props.children}
        </div>
    )
}

type RenderElementPropsWithCss = RenderElementProps & { cssClass: string }

const Paragraph = ({ cssClass, ...props }: RenderElementPropsWithCss) => {
    return (
        <React.Fragment>
            <br className="usfm-editor-break" />
            <span {...props.attributes} className={`${cssClass}`}>
                {props.children}
            </span>
        </React.Fragment>
    )
}

const Headers = (props: RenderElementProps) => {
    return (
        <div {...props.attributes} className="usfm-editor-headers">
            {props.children}
        </div>
    )
}
const Verse = (props: RenderElementProps) => {
    const empty =
        Node.string(props.element) === Node.string(props.element.children[0])
            ? " usfm-editor-empty-verse"
            : ""
    return (
        <span {...props.attributes} className={"usfm-editor-verse" + empty}>
            {props.children}
        </span>
    )
}

const InlineContainer = (props: RenderElementProps) => {
    return (
        <span {...props.attributes} className="usfm-editor-inline">
            {props.children}
        </span>
    )
}

const ChapterNumber = (props: RenderElementProps) => {
    return (
        <h1
            {...props.attributes}
            contentEditable={false}
            className={`usfm-marker-c usfm-editor-no-select ${numberClassNames(
                props.element
            )}`}
        >
            {props.children}
        </h1>
    )
}

const SectionHeader = (props: RenderElementProps) => {
    const sCssClass = "usfm-marker-s"
    const number = UsfmMarkers.destructureMarker(props.element.type)?.number
    if (
        number &&
        parseInt(number) == 5 &&
        Node.string(props.element).trim() === ""
    ) {
        // Some editors use \s5 as a chunk delimiter. Separate chunks by horizontal rules.
        return (
            <span contentEditable={false} className={sCssClass}>
                <hr {...props.attributes} className="usfm-editor-hr" />
                {props.children}
            </span>
        )
    } else {
        const headingTag = `h${number || 3}`
        const attribs = { className: sCssClass, ...props.attributes }
        return React.createElement(headingTag, attribs, props.children)
    }
}
