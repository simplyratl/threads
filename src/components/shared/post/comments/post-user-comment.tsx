import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import { useState, useRef } from "react";
import { User, Comment as CommentType } from "@prisma/client";
import ControlBarComment from "../controls/control-bar-comments";
import PostLine from "~/components/shared/post/post-line";
import { CommentWithChildren } from "~/components/shared/post/comments/comments";

interface Comment extends CommentType {
  user: User;
  childComments: Comment[];
}

interface PostUserProps {
  user: User;
  comment: CommentWithChildren;
  small?: boolean;
  childrenComments?: Comment[];
  className?: string;
  disableControlBar?: boolean;
}

function PostUserComment({
  user,
  small = false,
  comment,
  childrenComments,
  disableControlBar = false,
  className,
}: PostUserProps) {
  const displayThreadLine =
    comment.parentId || (childrenComments && childrenComments?.length > 0);

  return (
    <div className={`relative flex gap-2.5 sm:pl-4 sm:pr-6`}>
      <div className="relative-h-full">
        <div className="relative h-full">
          <Link
            href={`/profile/${user.id}`}
            rel="noopener noreferrer"
            className="flex gap-2"
          >
            <div className={`h-8 w-8 overflow-hidden rounded-full`}>
              <Image
                src={user.image as string}
                alt="test"
                fill
                className="!relative h-full w-full object-cover"
              />
            </div>
          </Link>
          {displayThreadLine && <PostLine fullHeight />}
        </div>
      </div>

      <div>
        <div className={`flex flex-col`}>
          <Link
            href={`/profile/${user.id}`}
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="text-sm font-semibold hover:opacity-70">
              {comment.user.name}
            </span>
            {comment.user.verified && (
              <span className="ml-1">
                <MdVerified className="text-blue-500" size={18} />
              </span>
            )}
            {comment.createdAt && (
              <>
                <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
                <div className="group relative ml-2">
                  <span
                    className={`relative text-sm font-semibold text-foreground hover:opacity-70`}
                  >
                    {formatToNowDate(new Date(comment.createdAt))}
                  </span>
                </div>
              </>
            )}
          </Link>

          <p>{comment.content}</p>

          {!disableControlBar && !comment.parentId && (
            <ControlBarComment
              comment={comment}
              likes={comment._count ? comment._count.likes : 0}
              reposts={comment._count ? comment._count.reposts : 0}
              likedByCurrentUser={comment.likedByCurrentUser}
              repostedByCurrentUser={comment.repostedByCurrentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PostUserComment;
