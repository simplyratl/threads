import React from "react";
import { motion } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import VideoPlayer from "~/components/shared/video-player";
import { PostWithUser } from "~/components/shared/post/post";

interface PostProps {
  post: PostWithUser;
  disableZoom?: boolean;
}

const DisplayMedia = ({ post, disableZoom }: PostProps) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const displayImage = () => {
    if (disableZoom) {
      return (
        <img
          className="h-full w-full object-cover"
          src={post.media as string}
          alt="post media"
        />
      );
    } else {
      return (
        <Zoom>
          <img
            className="h-full w-full object-cover"
            src={post.media as string}
            alt="post media"
          />
        </Zoom>
      );
    }
  };

  return (
    <>
      {post.media && (
        <motion.div
          className="mt-2 w-full cursor-pointer overflow-hidden rounded-xl lg:w-fit"
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            handleClick(e);
          }}
        >
          {post.mediaType === "IMAGE" ? (
            displayImage()
          ) : (
            <VideoPlayer url={post.media} />
          )}
        </motion.div>
      )}
    </>
  );
};

export default DisplayMedia;
