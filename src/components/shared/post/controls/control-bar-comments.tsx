import { Comment } from "@prisma/client";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useLayoutEffect, useState } from "react";
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

type ControlBarCommentProps = {
  comment: CommentWithChildren;
  likes: number;
  likedByCurrentUser: boolean;
};

function ControlBarComment({
  comment,
  likes,
  likedByCurrentUser,
}: ControlBarCommentProps) {
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
    if (!session?.user)
      return toast.error("You must be logged in to like!", {
        id: "like-error",
      });

    setLikedByCurrentUserState(!likedByCurrentUserState);
  }

  return (
    <>
      <div>
        <ControlButtons
          toggleLike={toggleLike}
          setShowAddCommentModal={setShowAddCommentModal}
          comment={comment}
          handleLike={handleLike}
          likedByCurrentUserState={likedByCurrentUser}
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
