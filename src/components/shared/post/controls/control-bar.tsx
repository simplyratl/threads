import { Post } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useLayoutEffect, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineSend,
} from "react-icons/ai";
import { api } from "~/utils/api";
import AddCommentModal from "~/components/shared/modals/add-comment-modal";
import post, { PostWithUser } from "~/components/shared/post/post";
import ControlCount from "~/components/shared/post/controls/control-count";
import ControlButtons from "~/components/shared/post/controls/control-buttons";

type ControlBarProps = {
  post: PostWithUser;
  postId: string;
  likes: number;
  comments: number;
  likedByCurrentUser: boolean;
  userId: string;
};

function ControlBar({
  post,
  postId,
  likes,
  comments,
  likedByCurrentUser,
  userId,
}: ControlBarProps) {
  const { data: session } = useSession();

  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [content, setContent] = useState("");

  const [likedByCurrentUserState, setLikedByCurrentUserState] =
    useState(likedByCurrentUser);

  const trpcUtils = api.useContext();

  const toggleLike = api.posts.toggleLike.useMutation({
    onSuccess: (addedLike) => {
      // toast.success("Post liked!");
    },
  });

  useEffect(() => {
    if (likedByCurrentUserState === likedByCurrentUser) return;
    if (!session?.user) return;
    setLikedByCurrentUserState(likedByCurrentUser);
  }, [likedByCurrentUser]);

  function handleLike() {
    if (!session?.user)
      return toast.error("You must be logged in to like!", {
        id: "like-error",
      });

    setLikedByCurrentUserState(!likedByCurrentUserState);

    const updateData: Parameters<
      typeof trpcUtils.posts.infinitePosts.setInfiniteData
    >[1] = (oldData) => {
      if (!oldData) return;

      const countModifier = !likedByCurrentUserState ? 1 : -1;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          return {
            ...page,
            posts: page.posts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  likedByCurrentUser: !likedByCurrentUserState,
                  _count: {
                    ...post._count,
                    likes: post._count.likes + countModifier,
                  },
                };
              }

              return post;
            }),
          };
        }),
      };
    };

    const updateSinglePost = (oldData: any) => {
      if (!oldData) return;

      const post = oldData.post;

      const countModifier = !likedByCurrentUserState ? 1 : -1;

      return {
        ...oldData,
        post: {
          ...post,
          likedByCurrentUser: !likedByCurrentUserState,
          _count: {
            ...post._count,
            likes: post._count.likes + countModifier,
          },
        },
      };
    };

    trpcUtils.posts.infinitePosts.setInfiniteData({}, updateData);
    trpcUtils.posts.infiniteProfileFeed.setInfiniteData({ userId }, updateData);
    trpcUtils.posts.getByID.setData({ id: postId }, updateSinglePost);
    void trpcUtils.users.getPostUserLikes.invalidate({ postId });

    Promise.resolve(toggleLike.mutate({ postId })).catch(() => {
      setLikedByCurrentUserState(false);
    });
  }

  const addComment = api.comments.addParentComment.useMutation({
    onSuccess: (comment) => {
      toast.success("Comment posted");
      setContent("");
      setShowAddCommentModal(false);

      const updateData = (oldData: any) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            comments: [comment, ...page.comments],
          })),
        };
      };

      trpcUtils.comments.getCommentsByPost.setInfiniteData(
        { postId },
        updateData
      );
    },
  });

  const handleAddComment = () => {
    if (!session?.user)
      return toast.error("You must be logged in to comment!", {
        id: "comment-error",
      });

    if (content.length === 0)
      return toast.error("Comment cannot be empty!", { id: "comment-error" });

    addComment.mutate({
      content,
      postId,
      receiverId: post.user.id,
    });
  };

  return (
    <div>
      <ControlButtons
        toggleLike={toggleLike}
        setShowAddCommentModal={setShowAddCommentModal}
        handleLike={handleLike}
        post={post}
        likedByCurrentUserState={likedByCurrentUser}
      />

      <div>
        <ControlCount likes={likes} comments={comments} post={post} />
      </div>

      <AddCommentModal
        post={post}
        handleCommentAdd={handleAddComment}
        isLoading={addComment.isLoading}
        content={content}
        setContent={setContent}
        setShowModal={setShowAddCommentModal}
        showModal={showAddCommentModal}
      />
    </div>
  );
}

export default ControlBar;
