import Image from "next/image";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { formatToNowDate } from "~/utils/formatToNowDate";

interface PostUserProps {
  id: string;
  username: string;
  avatar: string;
  verified?: boolean;
  timestamp?: Date;
  small?: boolean;
}

function PostUser({
  id,
  username,
  avatar,
  verified,
  timestamp,
  small = false,
}: PostUserProps) {
  const imageSize = small ? "h-8 w-8" : "h-10 w-10";
  const textSize = small ? "text-sm" : "text-base";

  return (
    <Link href={`/profile/${id}`} className="flex items-start">
      <div className={`${imageSize} overflow-hidden rounded-full`}>
        <Image
          src={avatar}
          alt="test"
          fill
          className="!relative h-full w-full object-cover"
        />
      </div>
      <div className={`${textSize} flex items-center`}>
        <span className="ml-3">{username}</span>
        {verified && (
          <span className="ml-1">
            <MdVerified className="text-blue-500" size={small ? 14 : 18} />
          </span>
        )}
        {timestamp && (
          <>
            <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
            <div className="ml-2">{formatToNowDate(new Date(timestamp))}</div>
          </>
        )}
      </div>
    </Link>
  );
}

export default PostUser;
