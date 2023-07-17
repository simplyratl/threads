import { Post } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState, useLayoutEffect } from "react";
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

  useLayoutEffect(() => {
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

        console.log(oldData);

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
      <div className="flex items-center gap-2">
        <div className="cursor-pointer hover:opacity-60">
          <div
            className="cursor-pointer hover:opacity-60"
            onClick={() => !toggleLike.isLoading && handleLike()}
          >
            {!likedByCurrentUserState ? (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <AiOutlineHeart className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AiFillHeart className="h-6 w-6 text-red-500" />
              </motion.div>
            )}
          </div>
        </div>
        <div
          className="cursor-pointer hover:opacity-60"
          onClick={() => setShowAddCommentModal(true)}
        >
          <AiOutlineMessage className="h-6 w-6" />
        </div>
        <div className="cursor-pointer hover:opacity-60">
          <AiOutlineSend className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">
          {likes ?? 0} likes
        </span>
        <span className="text-sm font-semibold text-foreground">
          {comments ?? 0} comments
        </span>
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
