import * as React from "react"

type Props = {
    idJson: string
    onChange: (s: string) => void
}

export const IdentificationSetter: React.FC<Props> = ({
    idJson,
    onChange,
}: Props) => {
    const textInputRef = React.createRef<HTMLInputElement>()
    return (
        <div className="identification-setter">
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">Identification Headers</h4>
                </div>
            </div>
            <span className="identification-input">
                <input
                    type="text"
                    key={idJson}
                    ref={textInputRef}
                    defaultValue={idJson}
                    style={{ width: "100%" }}
                />
            </span>
            <span className="identification-button">
                <button
                    onClick={(event) => onChange(textInputRef.current.value)}
                >
                    Set
                </button>
            </span>
        </div>
    )
}
