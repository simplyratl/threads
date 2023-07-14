"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

interface ImagePreviewProps {
  image: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean | null>>;
  show: boolean | null;
}

function ImagePreview({ image, setShow, show }: ImagePreviewProps) {
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50">
      {image && (
        <div
          className="flex h-full items-center bg-black bg-opacity-80"
          onClick={() => setShow(false)}
        >
          <Image
            src={image}
            alt="test123"
            fill
            className="!relative max-h-[80%] object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default ImagePreview;
