import React from "react";
// import PostUser from "@/components/ui/post-user";
import Image from "next/image";
import ControlBar from "./control-bar";
import ImagePreview from "../image-preview";
import PostUser from "./post-user";
import { Post, User } from "@prisma/client";

interface PostProps {
  post: Post & {
    user: User;
  };
  image?: string;
}

function Post({ post, image }: PostProps) {
  const [imagePreview, setImagePreview] = React.useState<boolean | null>(null);

  console.log(post);

  return (
    <article>
      <div className="before:bg-accent relative overflow-hidden before:absolute before:left-[18px] before:top-14 before:h-full before:w-0.5">
        <PostUser
          avatar={post.user.image as string}
          username={post.user.name as string}
          verified={post.user.verified}
          timestamp={new Date(post.createdAt)}
        />

        <div className="relative -top-4 ">
          <div className="ml-[52px]">
            <p>{post.content}</p>

            {image && (
              <div
                className="mt-2 w-full cursor-pointer overflow-hidden rounded-xl lg:w-fit"
                onClick={() => setImagePreview(true)}
              >
                <Image
                  src={image}
                  alt="test123"
                  fill
                  className="!relative max-h-[400px] w-full object-cover lg:object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative -top-1 ml-12">
          <ControlBar />
        </div>
      </div>

      <ImagePreview
        image={image}
        show={imagePreview}
        setShow={setImagePreview}
      />
    </article>
  );
}

export default Post;
