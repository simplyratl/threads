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
import Button from "../button";
import PostUserComment from "./post-user-comment";
import { CommentWithChildren } from "~/components/shared/post/comments";

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

      const updatedData = (oldData: CommentWithChildren[] | undefined) => {
        if (!oldData) return;

        return oldData.map((comm) => {
          if (comm.id === comment.parentId) {
            return {
              ...comm,
              childComments: [...comm.childComments, comment],
            };
          }

          return comm;
        });
      };

      trpcUtils.comments.getCommentsByPost.setData(
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
        <div className="flex items-center gap-2">
          <div className="cursor-pointer hover:opacity-60">
            <div
              className="cursor-pointer hover:opacity-60"
              onClick={() => !toggleLike.isLoading && handleLike()}
            >
              {!likedByCurrentUserState ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AiOutlineHeart className="h-7 w-7" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AiFillHeart className="h-7 w-7 text-red-500" />
                </motion.div>
              )}
            </div>
          </div>
          {!comment.parentId && (
            <div
              className="cursor-pointer hover:opacity-60"
              onClick={() => setShowAddCommentModal(true)}
            >
              <AiOutlineMessage className="h-6 w-6" />
            </div>
          )}
          <div className="cursor-pointer hover:opacity-60">
            <AiOutlineSend className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-2">
          <span className="font-semibold text-foreground">{likes} likes</span>
        </div>
      </div>

      <Modal
        show={showAddCommentModal}
        setShow={setShowAddCommentModal}
        title="Add comment"
      >
        <div>
          <PostUserComment
            comment={comment}
            user={comment.user}
            disableControlBar
          />

          <div className="mt-2 text-xs">
            <p className="font-semibold text-foreground">
              replying to <span className="">{comment.user.name}</span>
            </p>
          </div>

          <div className="mt-2 h-full">
            <TextareaAutosize
              className="w-full resize-none rounded border border-foreground bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-foreground"
              placeholder="Add a comment..."
              value={content}
              maxRows={20}
              // disabled={isSubmitting}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
            />

            <span className="text-sm font-semibold text-foreground">
              {content.length}/500
            </span>

            <div className="flex justify-end">
              <Button variant="minimal" onClick={() => handleCommentAdd()}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ControlBarComment;
