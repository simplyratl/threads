import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MdVerified } from "react-icons/md";

import Post, { PostWithUser } from "~/components/shared/post/post";

interface PostUserProps {
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
  post?: PostWithUser;
  big?: boolean;
}

const SmallPostUser = ({
  post,
  id,
  username,
  avatar,
  verified,
  big = false,
}: PostUserProps) => {
  const imageSize = big ? "h-10 w-10" : "h-6 w-6";
  const textSize = big ? "text-base" : "text-sm";

  return (
    <div className={`relative flex gap-2.5 pt-3`}>
      <div className="relative-h-full">
        <div className="relative h-full">
          <Link
            href={`/profile/${id}`}
            rel="noopener noreferrer"
            className="flex gap-2"
          >
            <div className={`${imageSize} overflow-hidden rounded-full`}>
              <Image
                src={avatar}
                alt="test"
                fill
                className="!relative h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>

      <div className="w-full">
        <div className={`flex flex-col ${textSize}`}>
          <Link
            href={`/profile/${id}`}
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <span className="font-semibold hover:opacity-70">{username}</span>
            {verified && (
              <span className="ml-1">
                <MdVerified className="text-blue-500" size={18} />
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmallPostUser;
