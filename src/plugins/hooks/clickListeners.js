import { useEffect } from "react";

export const useInsideOutsideClickListener = (
    ref, 
    onClickInside, 
    onClickOutside
) => {
    function handleClickInside(event) {
        if (ref.current && 
            ref.current.contains(event.target)
        ) {
            onClickInside()
            document.removeEventListener("mousedown", handleClickInside)
            document.addEventListener("mousedown", handleClickOutside);
        }
    }

    function handleClickOutside(event) {
        if (ref.current && 
            !ref.current.contains(event.target)
        ) {
            onClickOutside()
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