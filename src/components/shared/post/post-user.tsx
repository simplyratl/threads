import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import React, { useState, useRef } from "react";
import ControlBarComment from "~/components/shared/post/controls/control-bar-comments";
import Post, { PostWithUser } from "~/components/shared/post/post";
import ControlBar from "~/components/shared/post/controls/control-bar";
import DisplayMedia from "~/components/shared/post/display-media";
import PostLine from "~/components/shared/post/post-line";
import ReplyAvatars from "~/components/shared/post/reply-avatars";
import { useRouter } from "next/router";
import { HiOutlineArrowPathRoundedSquare } from "react-icons/hi2";
import { useSession } from "next-auth/react";

interface PostUserProps {
  post: PostWithUser;
  className?: string;
  disableControlBar?: boolean;
}

function PostUser({ post, className, disableControlBar }: PostUserProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id: profileId } = router.query;

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

  const singlePageReposted =
    router.pathname.includes("/profile/") &&
    profileId &&
    session?.user &&
    session.user.id === (profileId as string) && // if on profile page and viewing own profile;
    post.repostedByCurrentUser;

  return (
    <article>
      <Link
        href={`/thread/${post ? post.id : ""}`}
        className={`disable-tap-highlight group relative flex gap-2.5 border-b border-accent px-3 py-4 hover:bg-transparent sm:pl-4 sm:pr-6 md:hover:bg-accent ${
          singlePageReposted && post.repostedByCurrentUser
            ? "py-6 pt-10"
            : "sm:py-6"
        }`}
      >
        <div className="relative-h-full">
          <div className="relative h-full">
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
            {displayThreadLine && (
              <>
                <PostLine />
                <ReplyAvatars users={post.comments} />
              </>
            )}
          </div>
        </div>

        <div className="relative w-full">
          {singlePageReposted && (
            <div className="absolute bottom-[calc(100%+10px)] left-0 text-sm font-semibold text-foreground">
              <span className="absolute right-[calc(100%+8px)]">
                <HiOutlineArrowPathRoundedSquare className="h-5 w-5" />
              </span>
              <span>Reposted</span>
            </div>
          )}

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
                      className={`relative font-semibold text-foreground hover:opacity-70`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {formatToNowDate(new Date(post?.createdAt))}
                    </span>
                    {showTimestamp && (
                      <div className="absolute left-1/2 top-[calc(100%+4px)] z-40 flex h-full w-[140px] -translate-x-1/2 items-center justify-center rounded bg-[#000] px-2 text-sm font-semibold">
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

            {post && (
              <Post
                post={post}
                disableControlBar={disableControlBar ?? false}
              />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default PostUser;
