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
import DisplayMedia from "~/components/shared/post/display-media";

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
}

function Post({ post }: PostProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <article className="w-full">
      <Link
        href={`/thread/${post.id}`}
        className="disable-tap-highlight relative block overflow-hidden rounded-lg transition-colors duration-150"
      >
        <div className="relative">
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

            <div className="">
              <DisplayMedia post={post} />
            </div>
          </div>
        </div>

        <div className="w-fi3 mt-2" onClick={handleClick}>
          <ControlBar
            post={post}
            postId={post.id}
            likes={post._count.likes}
            comments={post._count.comments}
            likedByCurrentUser={post.likedByCurrentUser}
            userId={post.user.id}
          />
        </div>
      </Link>
    </article>
  );
}

export default Post;
