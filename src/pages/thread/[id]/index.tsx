import { useRouter } from "next/router";
import React from "react";
import Post from "~/components/shared/post/post";
import { api } from "~/utils/api";
import { ssgHelper } from "~/utils/ssg";

export default function ThreadPage() {
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();
  const { id } = router.query;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: post, isLoading } = api.posts.getByID.useQuery(
    { id: id as string },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      enabled: mounted,
    }
  );

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Thread</h1>

      <div className="mt-8">
        {!isLoading && post?.post && (
          <Post post={post.post} image={undefined} />
        )}
      </div>
    </main>
  );
}
