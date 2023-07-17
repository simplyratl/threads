import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import React, { useState, useRef } from "react";
import ControlBarComment from "~/components/shared/post/control-bar comments";
import Post, { PostWithUser } from "~/components/shared/post/post";
import ControlBar from "~/components/shared/post/control-bar";
import DisplayMedia from "~/components/shared/post/display-media";

interface PostUserProps {
  post: PostWithUser;
  className?: string;
}

function PostUser({ post, className }: PostUserProps) {
  const [showTimestamp, setShowTimestamp] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowTimestamp(true);
    }, 600);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current!);
    setShowTimestamp(false);
  };

  const displayThreadLine = post && post?._count.comments > 0;

  return (
    <article>
      <Link
        href={`/thread/${post ? post.id : ""}`}
        className={`disable-tap-highlight group relative flex gap-2.5 border-b border-accent py-6 pl-4 pr-6 hover:rounded-2xl hover:bg-transparent md:hover:bg-accent`}
      >
        <div className="relative-h-full">
          <div className="relative h-full">
            {displayThreadLine && (
              <div
                className={`absolute left-1/2 top-11 h-[80%] w-0.5 -translate-x-1/2 bg-accent`}
              ></div>
            )}
            <Link
              href={`/profile/${post.user.id}`}
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              <div className={`h-10 w-10 overflow-hidden rounded-full`}>
                <Image
                  src={post.user.image as string}
                  alt="test"
                  fill
                  className="!relative h-full w-full object-cover"
                />
              </div>
            </Link>
          </div>
        </div>

        <div className="w-full">
          <div className={`flex flex-col text-base`}>
            <Link
              href={`/profile/${post.user.id}`}
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <span className="font-semibold hover:opacity-70">
                {post.user.name}
              </span>
              {post.user.verified && (
                <span className="ml-1">
                  <MdVerified className="text-blue-500" size={18} />
                </span>
              )}
              {post?.createdAt && (
                <>
                  <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
                  <div className="group relative ml-2">
                    <span
                      className={`relative hover:opacity-70`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {formatToNowDate(new Date(post?.createdAt))}
                    </span>
                    {showTimestamp && (
                      <div className="absolute left-1/2 top-[calc(100%+4px)] z-40 flex h-full w-[140px] -translate-x-1/2 items-center justify-center rounded bg-accent px-2 text-sm">
                        {format(
                          new Date(post?.createdAt),
                          "HH:mm - MM/dd/yyyy"
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Link>

            {post && <Post post={post} />}
          </div>
        </div>
      </Link>
    </article>
  );

  // return (
  //   <Link
  //     href={`/profile/${id}`}
  //     rel="noopener noreferrer"
  //     className={`flex items-start ${className ?? ""}`}
  //   >
  //     <div className={`${imageSize} overflow-hidden rounded-full `}>
  //       <Image
  //         src={avatar}
  //         alt="test"
  //         fill
  //         className="!relative h-full w-full object-cover"
  //       />
  //     </div>
  //     <div className={`${textSize} flex items-center`}>
  //       <span className="ml-3 font-semibold hover:opacity-70">{username}</span>
  //       {verified && (
  //         <span className="ml-1">
  //           <MdVerified className="text-blue-500" size={small ? 14 : 18} />
  //         </span>
  //       )}
  //       {timestamp && (
  //         <>
  //           <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
  //           <div className="group relative ml-2">
  //             <span
  //               className={`relative hover:opacity-70`}
  //               onMouseEnter={handleMouseEnter}
  //               onMouseLeave={handleMouseLeave}
  //             >
  //               {formatToNowDate(new Date(timestamp))}
  //             </span>
  //             {showTimestamp && (
  //               <div className="absolute left-1/2 top-[calc(100%+4px)] z-40 flex h-full w-[140px] -translate-x-1/2 items-center justify-center rounded bg-accent px-2 text-sm">
  //                 {format(new Date(timestamp), "HH:mm - MM/dd/yyyy")}
  //               </div>
  //             )}
  //           </div>
  //         </>
  //       )}
  //     </div>
  //   </Link>
  // );
}

export default PostUser;
