import React from "react";
// import PostUser from "@/components/ui/post-user";
import Image from "next/image";
import ControlBar from "./control-bar";
import ImagePreview from "../image-preview";
import PostUser from "./post-user";
import { Post as PostType, User } from "@prisma/client";
import Link from "next/link";
// import { Post, User } from "@prisma/client";

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

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  console.log(post);

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
              <div
                className="mt-2 w-full cursor-pointer overflow-hidden rounded-xl lg:w-fit"
                onClick={() => setImagePreview(true)}
              >
                <Image
                  src={post.media}
                  alt={post.content}
                  fill
                  className="!relative max-h-[400px] w-full object-cover lg:object-contain"
                />
              </div>
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

      <ImagePreview
        image={image}
        show={imagePreview}
        setShow={setImagePreview}
      />
    </article>
  );
}

export default Post;
