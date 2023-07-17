import Image from "next/image";
import { api } from "~/utils/api";
import Post, { PostWithUser } from "./post";
import Loading from "../loading";
import { User, type Post as PostType } from "@prisma/client";
import InfiniteScroll from "react-infinite-scroll-component";
import { mockSession } from "next-auth/client/__tests__/helpers/mocks";
import user = mockSession.user;
import PostUser from "~/components/shared/post/post-user";

interface PostsProps {
  posts: PostWithUser[] | undefined;
  isLoading: boolean;
  hasMore: boolean | undefined;
  fetchNewPosts: any;
}

function Posts({ posts, isLoading, hasMore, fetchNewPosts }: PostsProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (!posts) {
    return <span>No posts</span>;
  }

  return (
    <section className="-m-4 flex-1 flex-shrink-0 overflow-hidden">
      <InfiniteScroll
        dataLength={posts?.length ?? 0}
        next={fetchNewPosts}
        hasMore={hasMore as boolean}
        loader={<Loading />}
        className="grid !overflow-hidden sm:gap-4"
        endMessage={
          <span className="mb-4 mt-2 text-center">No more posts</span>
        }
      >
        {posts.map((post, index) => (
          <div key={index}>
            <PostUser post={post} />
          </div>
        ))}
      </InfiniteScroll>
    </section>
  );
}

export default Posts;
