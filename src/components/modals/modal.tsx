import React, { useEffect, useRef } from "react";
import { HiXMark } from "react-icons/hi2";
import Button from "../shared/button";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title: string;
}

const Modal = ({ setShow, show, children, title }: ModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    elRef.current = document.getElementById("modal-root") as HTMLDivElement;
  }, [show]);

  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [show]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShow(false);
    };

    if (show) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  if (!elRef.current) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center bg-background_overlay"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.84 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.84 }}
            ref={contentRef}
            className="mx-4 mt-20 h-fit max-h-[80%] w-full overflow-auto rounded-2xl bg-accent p-4 sm:mx-0 sm:w-[600px]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <Button
                variant="outline"
                className="m-0 flex h-7 w-7 flex-shrink-0 items-center justify-center !p-0"
                onClick={() => setShow(false)}
              >
                <HiXMark size={18} />
              </Button>
            </div>

            <div className="mt-4">{children}</div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>,
    elRef.current
  );
};

export default Modal;
