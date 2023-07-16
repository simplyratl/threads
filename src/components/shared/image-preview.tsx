import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImagePreviewProps {
  image: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean | null>>;
  show: boolean | null;
  startPosition: any;
}

function ImagePreview({
  image,
  setShow,
  show,
  startPosition,
}: ImagePreviewProps) {
  // useEffect(() => {
  //   if (show) document.body.style.overflow = "hidden";
  //   else document.body.style.overflow = "auto";
  // }, [show]);
  const handleClick = () => {
    setShow(false);
  };

  const min = Math.min(window.innerWidth, window.innerHeight);

  const isMobile = window.innerWidth < 768; // Adjust this breakpoint as needed
  const adjustmentLeft = isMobile ? min * 0.35 : min * 0.23; // Adjust the values as needed
  const adjustmentTop = isMobile ? min * 0.35 : min * 0.23; // Adjust the values as needed

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-background_overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={handleClick}
          ></motion.div>
          <motion.div
            className="fixed inset-0 z-50 flex h-full w-full items-center justify-center"
            initial={{
              // opacity: 0,
              scale: 0.6,
              top: startPosition?.top + adjustmentTop,
              left: startPosition?.left + adjustmentLeft,
              x: "-50%",
              y: "-50%",
              zIndex: 100,
            }}
            animate={{
              // opacity: 1,
              scale: 1,
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              zIndex: 50,
            }}
            exit={{
              // opacity: 0,
              scale: 0.6,
              top: startPosition?.top + adjustmentTop,
              left: startPosition?.left + adjustmentLeft,
              x: "-50%",
              y: "-50%",
              zIndex: 100,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={handleClick}
          >
            {image && (
              <motion.img
                src={image}
                alt="test123"
                className="!relative max-h-[80%] rounded-2xl object-contain"
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ImagePreview;
