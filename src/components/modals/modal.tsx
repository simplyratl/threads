import React, { useEffect, useRef } from "react";
import { HiXMark } from "react-icons/hi2";
import Button from "../shared/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title: string;
  disableHideModal?: boolean;
}

const Modal = ({
  setShow,
  show,
  children,
  title,
  disableHideModal = false,
}: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDesktop = mounted && window.innerWidth > 768;

  const animationVariantContent = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.84, y: 100 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.84, y: 100 },
        transition: {
          ease: "easeInOut",
          duration: 0.3,
          type: "spring",
        },
      }
    : {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
        transition: {
          ease: "easeInOut",
          duration: 0.2,
          type: "tween",
        },
      };

  const animationVariantOverlay = isDesktop
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

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
      if (event.key === "Escape") !disableHideModal && setShow(false);
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
        !disableHideModal && setShow(false);
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
          variants={animationVariantOverlay}
          initial={animationVariantOverlay.initial}
          animate={animationVariantOverlay.animate}
          exit={animationVariantOverlay.exit}
          className="fixed inset-0 z-[999] flex justify-center bg-background_overlay"
        >
          <motion.div
            variants={animationVariantContent}
            initial={animationVariantContent.initial}
            animate={animationVariantContent.animate}
            exit={animationVariantContent.exit}
            transition={animationVariantContent.transition}
            ref={contentRef}
            className="h-[91.1vh] w-full overflow-auto bg-accent p-4 sm:mx-0 sm:mt-20 sm:h-fit sm:max-h-[80%] sm:w-[600px] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{title}</h2>
              {!disableHideModal && (
                <Button
                  variant="outline"
                  className="m-0 flex h-7 w-7 flex-shrink-0 items-center justify-center !p-0"
                  onClick={() => !disableHideModal && setShow(false)}
                >
                  <HiXMark size={18} />
                </Button>
              )}
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
