import React from "react";
// import PostUser from "@/components/ui/post-user";
import Image from "next/image";
import ControlBar from "./control-bar";
import ImagePreview from "../image-preview";
import PostUser from "./post-user";
import { Post as PostType, User } from "@prisma/client";
import Link from "next/link";
// import { Post, User } from "@prisma/client";
import { motion } from "framer-motion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import VideoPlayer from "~/components/shared/video-player";

export interface PostWithUser extends PostType {
  user: User;
  _count: {
    likes: number;
    comments: number;
    followers?: number;
  };
  likedByCurrentUser: boolean;
}

interface PostProps {
  post: PostWithUser;
  image?: string;
}

function Post({ post, image }: PostProps) {
  const [imagePreview, setImagePreview] = React.useState<boolean | null>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <article>
      <Link
        href={`/thread/${post.id}`}
        className="disable-tap-highlight relative block overflow-hidden rounded-lg p-3 transition-colors duration-150 before:absolute before:left-[30px] before:top-14 before:h-full before:w-0.5 before:bg-accent hover:bg-transparent md:hover:bg-accent"
      >
        <div className="w-fit" onClick={handleClick}>
          <PostUser
            id={post.user.id}
            avatar={post.user.image as string}
            username={post.user.name as string}
            verified={post.user.verified}
            timestamp={new Date(post.createdAt)}
          />
        </div>

        <div className="relative -top-4 ml-[52px]">
          <div className="">
            <p
              className={`break-before-auto whitespace-break-spaces ${
                post.content.split(" ").length === 1
                  ? "break-all"
                  : "break-words"
              }`}
            >
              {post.content}
            </p>

            {post.media && (
              <motion.div
                className="mt-2 w-full cursor-pointer overflow-hidden rounded-xl lg:w-fit"
                whileTap={{ scale: 0.98 }}
                ref={imageRef}
                onClick={(e) => {
                  setImagePreview(true);
                  handleClick(e);
                }}
              >
                {post.mediaType === "IMAGE" ? (
                  <Zoom>
                    <img
                      src={post.media}
                      alt={post.content}
                      className="h-full w-full object-cover"
                    />
                  </Zoom>
                ) : (
                  <VideoPlayer url={post.media} />
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div className="relative -top-1 ml-[52px] w-fit" onClick={handleClick}>
          <ControlBar
            postId={post.id}
            likes={post._count.likes}
            comments={post._count.comments}
            likedByCurrentUser={post.likedByCurrentUser}
            userId={post.user.id}
          />
        </div>
      </Link>

      {/*<ImagePreview*/}
      {/*  image={post.media as string}*/}
      {/*  show={imagePreview}*/}
      {/*  setShow={setImagePreview}*/}
      {/*  startPosition={imageRef.current?.getBoundingClientRect()}*/}
      {/*/>*/}
    </article>
  );
}

export default Post;
