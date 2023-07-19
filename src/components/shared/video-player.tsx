import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }: { url: string | null }) => {
  return (
    <div className="max-h-[560px]">
      <ReactPlayer url={url ?? ""} controls width="100%" height="100%" muted />
    </div>
  );
};

export default VideoPlayer;
