import React from "react";
import { motion } from "framer-motion";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineSend,
} from "react-icons/ai";
import { CommentWithChildren } from "~/components/shared/post/comments/comments";
import { PostWithUser } from "~/components/shared/post/post";
import { HiOutlineArrowPathRoundedSquare } from "react-icons/hi2";

interface ControlButtonsProps {
  toggleLike: any;
  setShowAddCommentModal: any;
  comment?: CommentWithChildren;
  post?: PostWithUser;
  handleLike: any;
  likedByCurrentUserState: boolean;
}

const ControlButtons = ({
  comment,
  likedByCurrentUserState,
  toggleLike,
  handleLike,
  post,
  setShowAddCommentModal,
}: ControlButtonsProps) => {
  return (
    <div className="mt-2 flex items-center gap-2">
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
      {comment && !comment.parentId ? (
        <div
          className="cursor-pointer hover:opacity-60"
          onClick={() => setShowAddCommentModal(true)}
        >
          <AiOutlineMessage className="h-6 w-6" />
        </div>
      ) : (
        <div
          className="cursor-pointer hover:opacity-60"
          onClick={() => setShowAddCommentModal(true)}
        >
          <AiOutlineMessage className="h-6 w-6" />
        </div>
      )}
      <div className="cursor-pointer hover:opacity-60">
        <HiOutlineArrowPathRoundedSquare className="h-6 w-6" />
      </div>
    </div>
  );
};

export default ControlButtons;
