import React from "react";
// import PostUser from "@/components/ui/post-user";
import ControlBar from "./controls/control-bar";
import { Post as PostType, User } from "@prisma/client";
import Link from "next/link";
// import { Post, User } from "@prisma/client";
import "react-medium-image-zoom/dist/styles.css";
import DisplayMedia from "~/components/shared/post/display-media";

export interface PostWithUser extends PostType {
  user: User;
  _count: {
    likes: number;
    comments: number;
    followers?: number;
  };
  comments: {
    user: {
      image: string;
    };
  }[];
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
}

interface PostProps {
  post: PostWithUser;
  disableControlBar?: boolean;
}

function Post({ post, disableControlBar }: PostProps) {
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

        {!disableControlBar && (
          <div className="w-fi3 mt-2" onClick={handleClick}>
            <ControlBar
              post={post}
              postId={post.id}
              likes={post._count.likes}
              comments={post._count.comments}
              likedByCurrentUser={post.likedByCurrentUser}
              repostedByCurrentUser={post.repostedByCurrentUser}
              userId={post.user.id}
            />
          </div>
        )}
      </Link>
    </article>
  );
}

export default Post;
