import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import React, { useRef, useState } from "react";
import Post, { PostWithUser } from "~/components/shared/post/post";
import PostLine from "~/components/shared/post/post-line";
import ReplyAvatars from "~/components/shared/post/reply-avatars";
import { useRouter } from "next/router";
import {
  HiLink,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineLink,
} from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import toast from "react-hot-toast";
import MinimalDropdown from "~/components/shared/ui/minimal-dropdown";

interface PostUserProps {
  post: PostWithUser;
  className?: string;
  disableControlBar?: boolean;
}

function PostUser({ post, className, disableControlBar }: PostUserProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id: profileId } = router.query;

  const currentURL =
    typeof window !== "undefined" ? window.location.origin : "";

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
        className={`disable-tap-highlight group relative flex gap-2.5 border-b border-border_color px-3 py-4 hover:bg-transparent sm:pl-4 sm:pr-6 md:hover:bg-accent ${
          singlePageReposted && post.repostedByCurrentUser
            ? "py-6 pt-10"
            : "sm:py-6"
        } ${className ?? ""}`}
      >
        <div className="relative-h-full">
          <div className="relative h-full">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void router.push(`/profile/${post.user.username as string}`);
              }}
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
            </div>
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
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void router.push(`/profile/${post.user.username as string}`);
              }}
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4"
            >
              <div className="flex w-full items-center justify-between sm:justify-start">
                <div className="flex items-center">
                  <span className="font-semibold hover:opacity-70">
                    {post.user.username ?? post.user.name}
                  </span>
                  {post.user.verified && (
                    <span className="ml-1">
                      <MdVerified className="text-blue-500" size={18} />
                    </span>
                  )}
                </div>
                {post?.createdAt && (
                  <>
                    <div className="ml-2 hidden h-1 w-1 rounded-full bg-foreground sm:block"></div>
                    <div className="group relative ml-2">
                      <span
                        className={`relative font-medium text-foreground hover:opacity-70`}
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
              </div>

              <MinimalDropdown>
                <li
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(`${currentURL}/thread/${post?.id}`)
                      .then(() => toast.success("Copied to clipboard."))
                      .catch(() => toast.error("Failed to copy to clipboard"));
                  }}
                >
                  <HiLink size={17} /> Copy link
                </li>
              </MinimalDropdown>
            </div>

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
