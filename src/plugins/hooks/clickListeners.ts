import { useEffect } from "react";

export const useInsideOutsideClickListener = (
    ref,
    onClickInside: ((event: MouseEvent) => void), 
    onClickOutside: ((event: MouseEvent) => void),
    disableIf: () => boolean = () => false
) => {
    function handleClickInside(event: MouseEvent) {
        if (!disableIf() &&
            ref.current && 
            ref.current.contains(event.target)
        ) {
            onClickInside(event)
            document.removeEventListener("mousedown", handleClickInside)
            document.addEventListener("mousedown", handleClickOutside);
        }
    }

    function handleClickOutside(event: MouseEvent) {
        if (!disableIf() &&
            ref.current && 
            !ref.current.contains(event.target)
        ) {
            onClickOutside(event)
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }

    useEffect(() => {
        // bind the click inside listener when the callback changes
        document.addEventListener("mousedown", handleClickInside);
    }, [onClickInside])

    useEffect(() => {
        return () => {
            // Unbind the event listener on clean up when the ref changes
            document.removeEventListener("mousedown", handleClickInside);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref])
}