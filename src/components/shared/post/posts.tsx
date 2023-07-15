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
      <div className="mx-auto mb-4 block h-10 w-10 md:hidden">
        <Image
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7cFYYdnIE7OeUJS72sOI4_CpDu-pywbSMjVN92DYgsSJKAmhHKiHKvgAZ6C7SCFavCwLeAwvQG2PH9CrVEj4b55sKuPUC5fhIUVk0SUS4k3OwGMosNz7Pr_HjE-pYE6gk1NY8L_Prf3r8LoivXBrPVbfj8_VNIuxHes7_Dme-SzKekL0h_X879lYMAI2s/w372-h413-p-k-no-nu/Threads%20Logo.png"
          fill
          alt="Logo"
          className={`inverted-logo !relative h-full w-full object-contain`}
        />
      </div>

      <InfiniteScroll
        dataLength={posts?.length ?? 0}
        next={fetchNewPosts}
        hasMore={hasMore as boolean}
        loader={<Loading />}
        className="grid gap-4 !overflow-hidden"
        // endMessage={<span>No more posts</span>}
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
