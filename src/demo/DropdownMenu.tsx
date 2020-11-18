import * as React from "react"

type Props = {
    id: string
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
    demoUsfmStrings: Map<string, string>
}

export const DropdownMenu: React.FC<Props> = ({
    id,
    onChange,
    demoUsfmStrings,
}: Props) => {
    return (
        <select id={id} required onChange={onChange}>
            {Array.from(demoUsfmStrings).map(([k, v]) => (
                <option key={k} value={v}>
                    {k}
                </option>
            ))}
        </select>
    )
}
