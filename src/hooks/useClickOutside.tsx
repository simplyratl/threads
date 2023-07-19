import { RefObject, useEffect } from "react";

type EventListener = (event: MouseEvent | TouchEvent) => void;

function useClickOutside(
  ref: RefObject<HTMLElement> | RefObject<HTMLElement>[],
  onClickOutside: EventListener
): void {
  const refsArray = Array.isArray(ref) ? ref : [ref];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      for (const ref of refsArray) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          onClickOutside(event);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [refsArray, onClickOutside]);
}

export default useClickOutside;
