import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";
import { useState, useRef } from "react";

interface PostUserProps {
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
  timestamp?: Date;
  small?: boolean;
  className?: string;
}

function PostUser({
  id,
  username,
  avatar,
  verified,
  timestamp,
  small = false,
  className,
}: PostUserProps) {
  const imageSize = small ? "h-8 w-8" : "h-10 w-10";
  const textSize = small ? "text-sm" : "text-base";

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

  return (
    <Link
      href={`/profile/${id}`}
      rel="noopener noreferrer"
      className={`flex items-start ${className ?? ""}`}
    >
      <div className={`${imageSize} overflow-hidden rounded-full`}>
        <Image
          src={avatar}
          alt="test"
          fill
          className="!relative h-full w-full object-cover"
        />
      </div>
      <div className={`${textSize} flex items-center`}>
        <span className="ml-3 font-semibold hover:opacity-70">{username}</span>
        {verified && (
          <span className="ml-1">
            <MdVerified className="text-blue-500" size={small ? 14 : 18} />
          </span>
        )}
        {timestamp && (
          <>
            <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
            <div className="group relative ml-2">
              <span
                className={`relative hover:opacity-70`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {formatToNowDate(new Date(timestamp))}
              </span>
              {showTimestamp && (
                <div className="absolute left-1/2 top-[calc(100%+4px)] z-40 flex h-full w-[140px] -translate-x-1/2 items-center justify-center rounded bg-accent px-2 text-sm">
                  {format(new Date(timestamp), "HH:mm - MM/dd/yyyy")}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

export default PostUser;
