import { useRouter } from "next/router";
import React from "react";
import Loading from "~/components/shared/loading";
import Comments from "~/components/shared/post/comments";
import Post, { PostWithUser } from "~/components/shared/post/post";
import { api } from "~/utils/api";

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

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Thread</h1>

      <div className="mt-8">
        {isLoading && <Loading />}
        {!isLoading && post?.post && (
          <Post post={post.post as PostWithUser} image={undefined} />
        )}

        <div className="mt-5">
          {!isLoading && post?.post && (
            <Comments postId={post?.post.id} post={post.post} />
          )}
        </div>
      </div>
    </main>
  );
}