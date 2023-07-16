import { type InferGetStaticPropsType, type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { MdVerified } from "react-icons/md";
import Button from "~/components/shared/button";
import Posts from "~/components/shared/post/posts";
import { api } from "~/utils/api";
import { ssgHelper } from "~/utils/ssg";
import {PostWithUser} from "~/components/shared/post/post";

const tabs = ["Threads", "Replies"];

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { data: user, isLoading } = api.users.getByID.useQuery(
    { id },
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const { data: session } = useSession();
  const loggedUser = session?.user;

  const trpcUtils = api.useContext();

  const toggleFollow = api.users.toggleFollow.useMutation({
    onSuccess: (follow) => {
      if (follow.addedFollow) {
        toast.success("Followed!", { id: "follow" });
      } else {
        toast.success("Unfollowed!", { id: "follow" });
      }

      const updateData = (oldData: any) => {
        if (!oldData) return;
        const counterModifier = follow.addedFollow ? 1 : -1;

        return {
          ...oldData,
          currUserFollowing: follow.addedFollow,
          _count: {
            ...oldData._count,
            followers: oldData._count.followers + counterModifier,
          },
        };
      };

      trpcUtils.users.getByID.setData({ id }, updateData);
    },
  });

  const postsData = api.posts.infiniteProfileFeed.useInfiniteQuery(
    { userId: user?.id ?? null },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const posts: any = postsData.data?.pages.flatMap((page) => page.posts);

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleFollow = () => {
    if (!loggedUser) return toast.error("You must be logged in to follow!");

    toggleFollow.mutate({ userId: user?.id as string });
  };

  return (
    <>
      <Head>
        <title>Threads | {user?.name}</title>
      </Head>
      <main className="mx-auto min-h-screen max-w-2xl gap-16 px-4 md:ml-[14%] lg:ml-[38%] lg:p-0">
        <div className="w-full">
          <div className="flex w-full justify-between">
            <div>
              <div>
                <h2 className="flex items-center gap-1 text-xl font-semibold sm:text-2xl">
                  {user?.name}{" "}
                  {user?.verified && (
                    <span>
                      <MdVerified className="text-blue-500" size={24} />
                    </span>
                  )}
                </h2>
                <h3 className="text-foreground">
                  {user?.name?.replace(" ", ".").toLowerCase()}
                </h3>
              </div>

              <div>
                <div className="mt-5 flex items-center gap-4">
                  {loggedUser?.id === user?.id ? (
                    <>
                      <Button variant="outline">Edit Profile</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          void signOut().then(() => {
                            window.location.pathname = "/";
                          });
                        }}
                      >
                        <span className="block">Logout</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant={!user?.currUserFollowing ? "outline" : "default"}
                      onClick={() => handleToggleFollow()}
                      disabled={toggleFollow.isLoading}
                    >
                      {user && user.currUserFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className="font-semibold">
                    Followers {user?._count?.followers}
                  </span>
                  <span className="font-semibold">
                    Following {user?._count?.following}
                  </span>
                </div>
              </div>
            </div>
            <div className="h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
              <Image
                src={user?.image as string}
                alt={`${user?.name as string} profile picture`}
                fill
                className="!relative h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex pt-4">
            {tabs.map((tab, index) => (
              <button
                className={`flex-1 border-b ${
                  activeTab === tab ? "border-foreground" : "border-accent"
                }`}
                onClick={() => handleActiveTab(tab)}
                key={index}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Posts
            posts={posts}
            isLoading={postsData.isLoading}
            fetchNewPosts={postsData.fetchNextPage}
            hasMore={postsData.hasNextPage}
          />
        </div>
      </main>
    </>
  );
};

export const getStaticProps = async (context: any) => {
  const id = context.params?.id;

  if (id === null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();

  await ssg.users.getByID.prefetch({ id });

  return {
    props: {
      id,
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
