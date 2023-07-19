import React, { useState } from "react";
import ListUsersModal from "~/components/shared/modals/list-users-modal";
import { api } from "~/utils/api";
import { PostWithUser } from "~/components/shared/post/post";
import { CommentWithChildren } from "~/components/shared/post/comments/comments";
import Link from "next/link";
import Loading from "~/components/shared/loading";
import { useRouter } from "next/router";

interface ControlCountProps {
  likes: number;
  comments?: number;
  post?: PostWithUser;
  comment?: CommentWithChildren;
}

const ControlCount = ({ comments, likes, post }: ControlCountProps) => {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const {
    data: postLikes,
    isLoading,
    isFetching,
  } = api.users.getPostUserLikes.useQuery(
    {
      postId: post?.id ?? null,
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!post?.id && showModal,
      staleTime: Infinity,
    }
  );

  // if (!post) return null;

  if (isFetching) return <Loading />;

  const flatten = () => {
    if (!postLikes) return [];
    return postLikes.likes.flatMap((like) => like.user);
  };

  return (
    <>
      <div className="mt-2 flex items-center gap-2 text-sm">
        {post && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void router.push(`/thread/${post.id}`);
            }}
            className="text-sm font-semibold text-foreground hover:opacity-60"
          >
            {comments ?? 0} {comments === 1 ? "reply" : "replies"}
          </div>
        )}
        <span
          className="font-semibold text-foreground hover:opacity-60"
          onClick={() => {
            post && setShowModal(true);
          }}
        >
          {likes ?? 0} {likes === 1 ? "like" : "likes"}
        </span>
      </div>

      <ListUsersModal
        showModal={showModal}
        setShowModal={setShowModal}
        title={"Likes"}
        users={flatten()}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    </>
  );
};

export default ControlCount;
