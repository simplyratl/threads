import Image from "next/image";
import { api } from "~/utils/api";
import Post from "./post";
import Loading from "../loading";
import { User, type Post as PostType } from "@prisma/client";
import InfiniteScroll from "react-infinite-scroll-component";

interface PostWithUser extends PostType {
  user: User;
  _count: {
    likes: number;
  };
  likedByCurrentUser: boolean;
}

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
    <section className="flex-1 flex-shrink-0 overflow-hidden">
      <InfiniteScroll
        dataLength={posts?.length ?? 0}
        next={fetchNewPosts}
        hasMore={hasMore as boolean}
        loader={<Loading />}
        className="grid gap-4 !overflow-hidden"
        endMessage={
          <span className="mb-4 mt-2 text-center">No more posts</span>
        }
      >
        {posts.map((post, index) => (
          <div key={index}>
            <Post post={post} image={undefined} />
          </div>
        ))}
      </InfiniteScroll>
    </section>
  );
}

export default Posts;
