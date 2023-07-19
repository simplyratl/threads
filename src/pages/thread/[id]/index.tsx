import { useRouter } from "next/router";
import React from "react";
import Loading from "~/components/shared/loading";
import Comments from "~/components/shared/post/comments/comments";
import { PostWithUser } from "~/components/shared/post/post";
import { api } from "~/utils/api";
import PostUser from "~/components/shared/post/post-user";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSideProps } from "~/pages/_app";
import { ssgHelper } from "~/utils/ssg";
import Head from "next/head";

export default function ThreadPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { id } = props;
  const router = useRouter();

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

  const comments: any = commentData.data?.pages.flatMap(
    (page) => page.comments
  );

  const currentURL =
    typeof window !== "undefined" ? window.location.origin : "";
  const threadTitle = `Thread | ${post?.post.user.name ?? ""} - ${
    post?.post.content.substring(0, 32) as string
  }...`;
  const threadDescription = `${post?.post.user.name ?? ""} - ${
    post?.post.content.substring(0, 32) as string
  }...`;
  const threadImage =
    (post?.post.mediaType as string) === "image" ? post?.post.media : "";

  return (
    <>
      <Head>
        <title>{threadTitle}</title>
        <meta title="description" content={threadDescription} />
        <meta property="og:title" content={threadTitle} />
        <meta property="og:description" content={threadDescription} />
        <meta property="og:image" content={threadImage ?? ""} />
        <meta property="og:url" content={`${currentURL}/thread`} />
        <meta property="og:type" content="website" />
      </Head>

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
    </>
  );
}

export const getStaticProps = async (
  context: GetServerSidePropsContext<{ id: string }>
) => {
  const ssg = ssgHelper();

  const id = context.params?.id as string;

  await ssg.posts.getByID.fetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 1,
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
