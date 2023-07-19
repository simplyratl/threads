import { Comment } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineSend,
} from "react-icons/ai";
import TextareaAutosize from "react-textarea-autosize";
import Modal from "~/components/modals/modal";
import { api } from "~/utils/api";
import Button from "../../button";
import PostUserComment from "../comments/post-user-comment";
import { CommentWithChildren } from "~/components/shared/post/comments/comments";
import AddCommentModal from "~/components/shared/modals/add-comment-modal";
import addCommentModal from "~/components/shared/modals/add-comment-modal";
import ControlCount from "~/components/shared/post/controls/control-count";
import ControlButtons from "~/components/shared/post/controls/control-buttons";
import { useRouter } from "next/router";

type ControlBarCommentProps = {
  comment: CommentWithChildren;
  likes: number;
  reposts: number;
  likedByCurrentUser: boolean;
  repostedByCurrentUser: boolean;
};

function ControlBarComment({
  comment,
  likes,
  likedByCurrentUser,
  reposts,
  repostedByCurrentUser,
}: ControlBarCommentProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [content, setContent] = useState("");

  const [likedByCurrentUserState, setLikedByCurrentUserState] = useState(
    session?.user ? likedByCurrentUser : false
  );

  const [repostedByCurrentUserState, setRepostedByCurrentUserState] = useState(
    session?.user ? repostedByCurrentUser : false
  );

  useEffect(() => {
    if (likedByCurrentUserState === likedByCurrentUser) return;
    if (!session?.user) return;
    setLikedByCurrentUserState(likedByCurrentUser);
  }, [likedByCurrentUser]);

  useEffect(() => {
    if (repostedByCurrentUserState === repostedByCurrentUser) return;
    if (!session?.user) return;
    setRepostedByCurrentUserState(repostedByCurrentUser);
  }, [repostedByCurrentUser]);

  const trpcUtils = api.useContext();

  const toggleLike = api.comments.toggleCommentLike.useMutation({
    onSuccess: (liked) => {
      setLikedByCurrentUserState(liked.liked);
    },
    onError: () => {
      toast.error("Error!");
      setLikedByCurrentUserState(!likedByCurrentUserState);
    },
  });

  const toggleRepost = api.comments.toggleCommentRepost.useMutation({
    onSuccess: (reposted) => {
      setLikedByCurrentUserState(reposted.reposted);
    },
    onError: () => {
      toast.error("Error!");
      setLikedByCurrentUserState(!likedByCurrentUserState);
    },
  });

  const addChildComment = api.comments.addChildComment.useMutation({
    onSuccess: (comment) => {
      toast.success("Comment added");

      const updatedData = (oldData: any) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            return {
              ...page,
              comments: page.comments.map((comm: any) => {
                if (comm.id === comment.parentId) {
                  return {
                    ...comm,
                    childComments: [...(comm.childComments ?? []), comment],
                  };
                }

                return comm;
              }),
            };
          }),
        };
      };

      trpcUtils.comments.getCommentsByPost.setInfiniteData(
        { postId: comment.postId },
        updatedData
      );
      setShowAddCommentModal(false);
      setContent("");
    },
  });

  const handleCommentAdd = () => {
    if (!session?.user)
      return toast.error("You must be logged in to comment!", {
        id: "comment-error",
      });

    if (content.length === 0)
      return toast.error("Comment cannot be empty!", { id: "comment-error" });

    if (comment.postId) {
      addChildComment.mutate({
        content,
        postId: comment.postId,
        parentId: comment.id,
        receiverId: comment.user.id,
      });
    } else {
      toast.error("Something went wrong");
    }
  };

  useLayoutEffect(() => {
    if (likedByCurrentUserState === likedByCurrentUser) return;
    if (!session?.user) return;
    setLikedByCurrentUserState(likedByCurrentUser);
  }, [likedByCurrentUser]);

  function handleLike() {
    if (!session?.user) {
      toast.error("You must be logged in to like!", {
        id: "like-error",
      });
      return;
    }

    setLikedByCurrentUserState(!likedByCurrentUserState);

    const updateData = (oldData: any) => {
      if (!oldData) return;

      const countModifier = !likedByCurrentUserState ? 1 : -1;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => {
          return {
            ...page,
            comments: page.comments.map((comm: any) => {
              if (comm.id === comment.id) {
                return {
                  ...comm,
                  likedByCurrentUser: !likedByCurrentUserState,
                  _count: {
                    ...comm._count,
                    likes: likes + countModifier,
                  },
                };
              }

              return comm;
            }),
          };
        }),
      };
    };

    trpcUtils.comments.getCommentsByUser.setInfiniteData(
      { userId: id as string },
      updateData
    );

    trpcUtils.comments.getCommentsByPost.setInfiniteData(
      { postId: comment.postId },
      updateData
    );
    // trpcUtils.posts.getByID.setData({ id: comment.postId }, updateData);
    // void trpcUtils.users.get.invalidate({});

    Promise.resolve(toggleLike.mutate({ commentId: comment.id })).catch(() => {
      setLikedByCurrentUserState(false);
    });
  }

  function handleRepost() {
    if (!session?.user) {
      toast.error("You must be logged in to repost!", {
        id: "like-error",
      });
      return;
    }

    setRepostedByCurrentUserState(!repostedByCurrentUserState);

    const updateData = (oldData: any) => {
      if (!oldData) return;

      const countModifier = !repostedByCurrentUserState ? 1 : -1;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => {
          return {
            ...page,
            comments: page.comments.map((comm: any) => {
              if (comm.id === comment.id) {
                return {
                  ...comm,
                  repostedByCurrentUser: !likedByCurrentUserState,
                  _count: {
                    ...comm._count,
                    reposts: reposts + countModifier,
                  },
                };
              }

              return comm;
            }),
          };
        }),
      };
    };

    trpcUtils.comments.getCommentsByUser.setInfiniteData(
      { userId: id as string },
      updateData
    );

    trpcUtils.comments.getCommentsByPost.setInfiniteData(
      { postId: comment.postId },
      updateData
    );

    Promise.resolve(toggleRepost.mutate({ commentId: comment.id })).catch(
      () => {
        setRepostedByCurrentUserState(false);
      }
    );
  }

  return (
    <>
      <div>
        <ControlButtons
          toggleLike={toggleLike}
          setShowAddCommentModal={setShowAddCommentModal}
          comment={comment}
          handleLike={handleLike}
          toggleRepost={toggleRepost}
          handleRepost={handleRepost}
          repostedByCurrentUserState={repostedByCurrentUserState}
          likedByCurrentUserState={likedByCurrentUserState}
        />
        <div className="mt-2">
          <ControlCount likes={likes} />
        </div>
      </div>

      <AddCommentModal
        comment={comment}
        handleCommentAdd={handleCommentAdd}
        isLoading={addChildComment.isLoading}
        content={content}
        setContent={setContent}
        setShowModal={setShowAddCommentModal}
        showModal={showAddCommentModal}
      />
    </>
  );
}

export default ControlBarComment;
