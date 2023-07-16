import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }: { url: string | null }) => {
  return (
    <ReactPlayer url={url ?? ""} controls width="100%" height="100%" muted />
  );
};

export default VideoPlayer;
