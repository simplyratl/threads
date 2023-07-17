import { Comment, Post, User } from "@prisma/client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "~/utils/api";
import Button from "../../button";
import PostUserComment from "./post-user-comment";
import Loading from "~/components/shared/loading";
import InfiniteScroll from "react-infinite-scroll-component";

interface CommentsProps {
  postId?: string;
  post?: Post & {
    user: User;
  };
  comments?: CommentWithChildren[];
  commentData?: any;
}

export interface CommentWithChildren extends Comment {
  childComments: any;
  user: User;
}

export default function Comments({
  postId,
  post,
  comments,
  commentData,
}: CommentsProps) {
  const [content, setContent] = useState<string>("");
  const [showComments, setShowComments] = useState<
    {
      commentId: string;
    }[]
  >([]);

  const trpcUtils = api.useContext();

  const addComment = api.comments.addParentComment.useMutation({
    onSuccess: (comment) => {
      toast.success("Comment posted");
      setContent("");

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

      if (postId) {
        trpcUtils.comments.getCommentsByPost.setInfiniteData(
          { postId },
          updateData
        );
      }
    },
  });

  const handleAddComment = () => {
    if (!content) return toast.error("Comment cannot be empty");
    if (!postId || !post) return toast.error("Error getting post data");

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
          <Button
            variant="minimal"
            className="!p-0 text-sm text-foreground"
            onClick={() => showParentCommentsClick(comment)}
          >
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

  if (commentData.isLoading) return <Loading />;

  return (
    <div>
      <div className="mt-2">
        <ul className="grid">
          <InfiniteScroll
            dataLength={comments?.length ?? 0}
            next={commentData.fetchNextPage}
            hasMore={commentData.hasNextPage as boolean}
            loader={<Loading />}
            className="grid gap-4 !overflow-hidden"
            endMessage={
              <span className="mb-4 mt-2 text-center">No more replies</span>
            }
          >
            {!commentData.isLoading &&
              comments &&
              comments.map((comment: CommentWithChildren) => (
                <li key={comment.id}>
                  <PostUserComment
                    comment={comment}
                    user={comment.user}
                    childrenComments={comment.childComments}
                  />

                  <div className="mt-4 border-b border-accent pb-2 min-[400px]:pl-8">
                    {comment.childComments &&
                      comment.childComments.length > 0 && (
                        <>{showCommentsOrButton(comment)}</>
                      )}
                  </div>
                </li>
              ))}
          </InfiniteScroll>
        </ul>
      </div>
    </div>
  );
}
