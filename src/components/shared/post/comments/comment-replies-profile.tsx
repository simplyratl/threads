import React from "react";
import { CommentWithChildren } from "~/components/shared/post/comments/comments";
import Loading from "~/components/shared/loading";
import InfiniteScroll from "react-infinite-scroll-component";
import PostUserComment from "~/components/shared/post/comments/post-user-comment";
import PostUser from "~/components/shared/post/post-user";
import { PostWithUser } from "~/components/shared/post/post";

interface CommentsProps {
  comments?: CommentWithChildren[];
  commentData?: any;
}

const CommentRepliesProfile = ({ commentData, comments }: CommentsProps) => {
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
                <li key={comment.id} className="border-b border-border_color">
                  {comment.post && (
                    <div className="flex flex-col">
                      <PostUser post={comment.post} className="!border-none" />
                      <div className="py-4">
                        <PostUserComment
                          comment={comment}
                          user={comment.user}
                          childrenComments={comment.childComments}
                        />
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </InfiniteScroll>
        </ul>
      </div>
    </div>
  );
};

export default CommentRepliesProfile;
