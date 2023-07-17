import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import { useState, useRef } from "react";
import { User, Comment as CommentType } from "@prisma/client";
import ControlBarComment from "./control-bar comments";

interface Comment extends CommentType {
  user: User;
  childComments: Comment[];
}

interface PostUserProps {
  user: User;
  comment: Comment;
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

  const displayThreadLine =
    comment.parentId || (childrenComments && childrenComments?.length > 0);

  return (
    <div className={`relative flex gap-2.5 pt-4`}>
      <div className="relative-h-full">
        <div className="relative h-full">
          {displayThreadLine && (
            <div
              className={`absolute left-1/2 top-11 h-[56%] w-0.5 -translate-x-1/2 bg-accent`}
            ></div>
          )}
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
        </div>
      </div>

      <div>
        <div className={`flex flex-col`}>
          <Link
            href={`/profile/${user.id}`}
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="font-semibold hover:opacity-70">
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
                  <span className={`relative hover:opacity-70`}>
                    {formatToNowDate(new Date(comment.createdAt))}
                  </span>
                </div>
              </>
            )}
          </Link>

          <p>{comment.content}</p>

          {!disableControlBar && (
            <div className="mt-2">
              <ControlBarComment
                comment={comment}
                likes={0}
                likedByCurrentUser={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostUserComment;
