import { Comment, Post, User } from "@prisma/client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { api } from "~/utils/api";
import Button from "../button";
import PostUserComment from "./post-user-comment";
import Loading from "~/components/shared/loading";

interface CommentsProps {
  postId: string;
  post: Post & {
    user: User;
  };
}

export interface CommentWithChildren extends Comment {
  childComments: any;
  user: User;
}

export default function Comments({ postId, post }: CommentsProps) {
  const [content, setContent] = useState<string>("");
  const [showComments, setShowComments] = useState<
    {
      commentId: string;
    }[]
  >([]);

  const { data: comments, isLoading } = api.comments.getCommentsByPost.useQuery(
    { postId },
    {
      refetchOnWindowFocus: false,
    }
  );

  const trpcUtils = api.useContext();

  const addComment = api.comments.addParentComment.useMutation({
    onSuccess: (comment) => {
      toast.success("Comment posted");
      setContent("");

      const updateData = (oldData: any) => {
        if (!oldData) return;

        return [comment, ...oldData];
      };

      trpcUtils.comments.getCommentsByPost.setData({ postId }, updateData);
    },
  });

  const handleAddComment = () => {
    addComment.mutate({
      content,
      postId,
      receiverId: post.user.id,
    });
  };

  const showParentCommentsClick = (comment: Comment) => {
    setShowComments((prev) => [...prev, { commentId: comment.id }]);
  };

  const showCommentsOrButton = (comment: CommentWithChildren) => {
    if (comment.childComments && comment.childComments.length > 0) {
      if (
        showComments.length === 0 ||
        !showComments.find((c) => c.commentId === comment.id)
      ) {
        return (
          <Button onClick={() => showParentCommentsClick(comment)}>
            Show replies
          </Button>
        );
      }

      if (
        showComments &&
        showComments.find((c) => c.commentId === comment.id)
      ) {
        return (
          <ul className="grid gap-4">
            {comment.childComments.map((childComment: CommentWithChildren) => (
              <li key={childComment.id}>
                <PostUserComment
                  comment={childComment}
                  user={childComment.user}
                />
              </li>
            ))}
          </ul>
        );
      }
    }

    return null;
  };

  if(isLoading) return <Loading />

  return (
    <div>
      <div>
        <div>
          <TextareaAutosize
            className="w-full resize-none rounded border border-foreground bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-foreground"
            placeholder="Start a thread..."
            value={content}
            // disabled={isSubmitting}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {content.length}/500
            </span>
            <Button onClick={() => void handleAddComment()}>Post</Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ul className="grid gap-4">
          {!isLoading &&
            comments &&
            comments.map((comment: CommentWithChildren) => (
              <li key={comment.id}>
                <PostUserComment
                  comment={comment}
                  user={comment.user}
                  childrenComments={comment.childComments}
                />

                <div className="mt-4 min-[400px]:pl-8">
                  {comment.childComments &&
                    comment.childComments.length > 0 && (
                      <>{showCommentsOrButton(comment)}</>
                    )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
