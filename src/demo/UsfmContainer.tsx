import PropTypes from "prop-types"
import * as React from "react";

type UsfmProps = { usfm: string }
type UsfmContainerProps = UsfmProps & { title: string }

export const UsfmContainer = ({ title, usfm }: UsfmContainerProps): JSX.Element => {
    return (
        <div>
            <h2>{title}</h2>
            <pre className="usfm-container">{usfm}</pre>
        </div>
    )
}
UsfmContainer.propTypes = {
    title: PropTypes.string.isRequired,
    usfm: PropTypes.string.isRequired,
}

const usfmPropTypes = {
    usfm: PropTypes.string.isRequired,
} as const

export const InputUsfm = ({ usfm }: UsfmProps): JSX.Element => {
    return (
        <UsfmContainer
            title={"Input USFM"}
            usfm={usfm}
        />
    )
}
InputUsfm.propTypes = usfmPropTypes

export const OutputUsfm = ({ usfm }: UsfmProps): JSX.Element => {
    return (
        <UsfmContainer
            title={"Output USFM"}
            usfm={usfm}
        />
    )
}
OutputUsfm.propTypes = usfmPropTypes
