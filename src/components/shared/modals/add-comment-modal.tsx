import React from "react";
import PostUserComment from "~/components/shared/post/post-user-comment";
import TextareaAutosize from "react-textarea-autosize";
import Button from "~/components/shared/button";
import Modal from "~/components/modals/modal";
import { Comment as CommentType } from ".prisma/client";
import { User } from "@prisma/client";
import { PostWithUser } from "~/components/shared/post/post";
import DisplayMedia from "~/components/shared/post/display-media";
import PostUser from "~/components/shared/post/post-user";
import SmallPostUser from "~/components/shared/post/small-post-user";

interface Comment extends CommentType {
  user: User;
  childComments: Comment[];
}

interface AddCommentModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  comment?: Comment;
  post?: PostWithUser;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleCommentAdd: () => void;
}

const AddCommentModal = ({
  setShowModal,
  showModal,
  comment,
  handleCommentAdd,
  setContent,
  content,
  isLoading,
  post,
}: AddCommentModalProps) => {
  const displayReplyingTo = () => {
    if (comment) {
      return comment.user.name;
    } else if (post) {
      return post.user.name;
    } else {
      return "unknown";
    }
  };

  const displayThread = () => {
    if (comment) {
      return (
        <PostUserComment
          comment={comment}
          user={comment.user}
          disableControlBar
        />
      );
    } else {
      if (post)
        return (
          <SmallPostUser
            id={post.user.id}
            avatar={post.user.image as string}
            verified={post.user.verified}
            big
            username={post.user.name as string}
          />
        );
    }
  };

  return (
    <Modal show={showModal} setShow={setShowModal} title="Add comment">
      <div>
        {displayThread()}

        {post && post.media && (
          <div className="pl-11">
            <DisplayMedia post={post} disableZoom />
          </div>
        )}

        <div className="mt-4 text-xs">
          <p className="font-semibold text-foreground">
            replying to <span className="">{displayReplyingTo()}</span>
          </p>
        </div>

        <div className="mt-2 h-full">
          <TextareaAutosize
            className="w-full resize-none rounded border border-foreground bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-foreground"
            placeholder="Add a comment..."
            value={content}
            maxRows={20}
            disabled={isLoading}
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
  );
};

export default AddCommentModal;
