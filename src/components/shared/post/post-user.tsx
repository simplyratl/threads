import { formatDistanceToNow } from "date-fns";
import { MdVerified } from "react-icons/md";

interface PostUserProps {
  username: string;
  avatar: string;
  verified?: boolean;
  timestamp?: Date;
}

function PostUser({ username, avatar, verified, timestamp }: PostUserProps) {
  return (
    <div className="flex items-start">
      <div className="h-10 w-10 overflow-hidden rounded-full">
        <img src={avatar} alt="test" className="h-full w-full object-cover" />
      </div>
      <div className="flex items-center">
        <span className="ml-3">{username}</span>
        {verified && (
          <span className="ml-1">
            <MdVerified className="text-blue-500" size={18} />
          </span>
        )}
        {timestamp && (
          <>
            <div className="ml-2 h-1 w-1 rounded-full bg-neutral-500 dark:bg-neutral-300"></div>
            <div className="ml-2">{formatDistanceToNow(timestamp)}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default PostUser;
