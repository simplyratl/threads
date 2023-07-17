import { useRouter } from "next/router";
import React from "react";
import Loading from "~/components/shared/loading";
import Comments from "~/components/shared/post/comments/comments";
import Post, { PostWithUser } from "~/components/shared/post/post";
import { api } from "~/utils/api";
import PostUser from "~/components/shared/post/post-user";

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data: post, isLoading } = api.posts.getByID.useQuery(
    { id: id as string },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  const commentData = api.comments.getCommentsByPost.useInfiniteQuery(
    { postId: post?.post.id ?? null },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      enabled: !!post?.post,
    }
  );

  const comments = commentData.data?.pages.flatMap((page) => page.comments);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Thread</h1>

      <div className="mt-8">
        {isLoading && <Loading />}
        {!isLoading && post?.post && (
          <PostUser post={post.post as PostWithUser} />
        )}

        <div className="mt-5">
          {!isLoading && post?.post && (
            <Comments
              comments={comments}
              commentData={commentData}
              postId={post?.post.id}
              post={post.post}
            />
          )}
        </div>
      </div>
    </main>
  );
}
