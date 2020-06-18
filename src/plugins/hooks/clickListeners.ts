import { useEffect } from "react";

export const useInsideOutsideClickListener = (
    ref,
    onClickInside: ((event: MouseEvent) => void), 
    onClickOutside: ((event: MouseEvent) => void),
    disableIf: () => boolean = () => false,
    string
) => {
    function handleClickInside(event: MouseEvent) {
        console.log("string: ", string)
        console.log("   inside inside: ref:", ref)
        if (!disableIf() &&
            ref.current && 
            ref.current.contains(event.target)
        ) {
            onClickInside(event);
            document.removeEventListener("mousedown", handleClickInside);
            document.addEventListener("mousedown", handleClickOutside);
        }
    }

    function handleClickOutside(event: MouseEvent) {
        console.log("string: ", string)
        console.log("   inside OUTSIDE: ref:", ref)
        if (!disableIf() &&
            ref.current && 
            !ref.current.contains(event.target)
        ) {
            onClickOutside(event);
            document.removeEventListener("mousedown", handleClickOutside);
            document.addEventListener("mousedown", handleClickInside);
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickInside);
        return () => {
            // Unbind the event listener on clean up when the ref changes
            document.removeEventListener("mousedown", handleClickInside);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref])
}