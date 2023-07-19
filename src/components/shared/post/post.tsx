import React, { useEffect, useState } from "react";
// import PostUser from "@/components/ui/post-user";
import ControlBar from "./controls/control-bar";
import { Post as PostType, Repost, User } from "@prisma/client";
import Link from "next/link";
// import { Post, User } from "@prisma/client";
import "react-medium-image-zoom/dist/styles.css";
import DisplayMedia from "~/components/shared/post/display-media";
import { useRouter } from "next/router";
import { useDebounce } from "use-debounce";
import { api } from "~/utils/api";
import Image from "next/image";
import Button from "~/components/shared/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export interface PostWithUser extends PostType {
  user: User;
  _count: {
    likes: number;
    comments: number;
    followers?: number;
  };
  comments: {
    user: {
      image: string;
    };
  }[];
  reposts: Repost[];
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
}

interface PostProps {
  post: PostWithUser;
  disableControlBar?: boolean;
}

function Post({ post, disableControlBar }: PostProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [showMentionInfo, setShowMentionInfo] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const [debouncedShowMentionInfo] = useDebounce(isDebounced, 600);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const mentionInfo = api.users.getMentionInfo.useMutation();

  useEffect(() => {
    if (mentionInfo.data !== undefined && mentionInfo.data.currUserFollowing) {
      setIsFollowing(mentionInfo.data.currUserFollowing ?? false);
      setFollowersCount(mentionInfo.data._count?.followers ?? 0);
    } else {
      setIsFollowing(false);
      setFollowersCount(0);
    }
  }, [mentionInfo.data]);

  useEffect(() => {
    setShowMentionInfo(debouncedShowMentionInfo);
  }, [debouncedShowMentionInfo]);

  const toggleFollow = api.users.toggleFollow.useMutation({
    onError: (error) => {
      toast.error(error.message);
      setIsFollowing(false);
    },
  });

  const handleToggleFollow = (userId: string) => {
    if (!session?.user) return toast.error("You must be logged in to follow!");
    if (!userId) return toast.error("User not found!");
    if (userId === session?.user?.id)
      return toast.error("You can't follow yourself!", {
        id: "follow",
      });

    toggleFollow.mutate({ userId });

    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((prev) => prev - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    }
  };

  const handleMouseLeave = () => {
    setIsDebounced(false);
  };

  const handleMouseEnter = (username: string) => {
    if (window.innerWidth < 768) return;

    setIsDebounced(true);

    const cachedData = mentionInfo.data?.username === username.slice(1);
    if (!cachedData) {
      // If not in cache, fetch the data for the mention
      mentionInfo.mutate({ name: username.slice(1) });
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const generateMentions = () => {
    const splitContent = post.content.split(" ");

    return splitContent.map((word, index) => {
      const regex = /@\w+/g;

      const mention = word.match(regex);

      const checkMentionSpace = () => {
        if (
          splitContent[index - 1] !== undefined &&
          mention &&
          splitContent[index - 1]!.match(regex)
        ) {
          return <span> {word}</span>;
        } else {
          return <span>{word}</span>;
        }
      };

      if (mention) {
        // Retrieve mention data from cache (if available)
        const mentionData =
          mentionInfo.data?.username === word.slice(1)
            ? mentionInfo.data
            : null;

        return (
          <span
            key={index}
            className="relative text-blue-500 hover:text-blue-400"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void router.push(`/profile/${word.slice(1)}`);
            }}
            onMouseEnter={() => handleMouseEnter(word)}
            onMouseLeave={handleMouseLeave}
          >
            {checkMentionSpace()}

            {mentionData !== null &&
              debouncedShowMentionInfo &&
              mentionInfo.data?.username === word.slice(1) && (
                <AnimatePresence>
                  {debouncedShowMentionInfo && mentionInfo.data && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -40 }}
                      className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[200px] w-[300px] overflow-hidden rounded-xl bg-background p-4 shadow-sm shadow-white"
                    >
                      <div className="text-white">
                        <div className="flex items-start justify-between">
                          <Image
                            src={mentionInfo.data.image as string}
                            alt={mentionInfo.data.username}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <Button
                            variant="rounded"
                            className=""
                            onClick={(e) => {
                              handleClick(e);
                              handleToggleFollow(mentionInfo.data.id as string);
                            }}
                          >
                            {isFollowing ? "Unfollow" : "Follow"}
                          </Button>
                        </div>
                        <div className="mt-2">
                          <h5 className="text-base font-semibold">
                            @{mentionInfo.data.username}
                          </h5>
                        </div>
                        <div className="flex gap-2">
                          <span>Followers {followersCount}</span>
                          <span>
                            Following{" "}
                            {mentionInfo.data._count !== undefined
                              ? mentionInfo.data._count.following
                              : 0}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
          </span>
        );
      }

      if (
        splitContent[index - 1] !== undefined &&
        splitContent[index - 1]!.match(regex)
      ) {
        return " " + word + " ";
      }

      if (splitContent.length === index + 1) {
        return word;
      }

      return word + " ";
    });
  };

  return (
    <article className="w-full">
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void router.push(`/thread/${post.id}`);
        }}
        className="disable-tap-highlight relative block rounded-lg transition-colors duration-150"
      >
        <div className="relative">
          <div className="">
            <div
              className={`break-before-auto whitespace-break-spaces ${
                post.content.split(" ").length === 1
                  ? "break-all"
                  : "break-words"
              }`}
            >
              {generateMentions()}
            </div>

            <div className="">
              <DisplayMedia post={post} />
            </div>
          </div>
        </div>

        {!disableControlBar && (
          <div className="w-fi3 mt-2" onClick={handleClick}>
            <ControlBar
              post={post}
              postId={post.id}
              likes={post._count.likes}
              comments={post._count.comments}
              likedByCurrentUser={post.likedByCurrentUser}
              repostedByCurrentUser={post.repostedByCurrentUser}
              userId={post.user.id}
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default Post;
