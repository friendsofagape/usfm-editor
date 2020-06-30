import * as React from "react";

export const IdentificationSetter = ({ idJson, onChange }) => {
    const textInputRef = React.createRef()
    return (
        <div className="id-setter">
            <div className="row">
                <div className="column">
                    <h4 className="margin-below-15px float-left">
                        Identification Headers
                    </h4>
                </div>
            </div>
            <span className="width-80 float-left">
                <input 
                    type="text" 
                    key={idJson}
                    ref={textInputRef} 
                    defaultValue={idJson} 
                    className={"identification-text-box"}
                />
            </span>
            <span className="width-20 float-right">
                <button onClick={event => 
                    onChange(textInputRef.current.value)
                }>Set</button>
            </span>
        </div>
    )
}