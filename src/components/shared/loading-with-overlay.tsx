import React from "react";
import Loading from "~/components/shared/loading";

const LoadingWithOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background_overlay">
      <Loading />
    </div>
  );
};

export default LoadingWithOverlay;
