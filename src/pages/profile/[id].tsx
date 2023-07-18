import { type InferGetStaticPropsType, type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdVerified } from "react-icons/md";
import Button from "~/components/shared/button";
import Posts from "~/components/shared/post/posts";
import { api } from "~/utils/api";
import { ssgHelper } from "~/utils/ssg";
import { PostWithUser } from "~/components/shared/post/post";
import ListUsersModal from "~/components/shared/modals/list-users-modal";
import Comments from "~/components/shared/post/comments/comments";
import { User } from "@prisma/client";
import CommentRepliesProfile from "~/components/shared/post/comments/comment-replies-profile";

const tabs = ["Threads", "Replies"];

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedModal, setSelectedModal] = useState("");

  useEffect(() => {
    if (!showModal) setSelectedModal("");
  }, [showModal]);

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

  const commentsData = api.comments.getCommentsByUser.useInfiniteQuery(
    { userId: user?.id ?? null },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      enabled: !postsData.isLoading,
    }
  );

  const posts: any = postsData.data?.pages.flatMap((page) => page.posts);
  const comments: any = commentsData.data?.pages.flatMap(
    (page) => page.comments
  );

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
      <main className="mx-auto min-h-screen max-w-lg gap-16 px-4 md:ml-[14%] lg:ml-[34%] lg:max-w-xl lg:p-0">
        {/*<main className="mx-auto min-h-screen max-w-lg px-4 md:ml-auto lg:ml-[34%] lg:max-w-4xl lg:p-0">*/}
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
                  <span
                    className="block cursor-pointer font-semibold hover:opacity-60"
                    onClick={() => {
                      setShowModal(true);
                      setSelectedModal("followers");
                    }}
                  >
                    Followers {user?._count?.followers}
                  </span>
                  <span
                    className="block cursor-pointer font-semibold hover:opacity-60"
                    onClick={() => {
                      setShowModal(true);
                      setSelectedModal("following");
                    }}
                  >
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

          <div className="mt-3 flex">
            {tabs.map((tab, index) => (
              <button
                className={`flex-1 rounded-t border-b py-2 ${
                  activeTab === tab
                    ? "border-border_color"
                    : "border-border_color hover:bg-accent"
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
          {activeTab === "Threads" ? (
            <Posts
              posts={posts}
              isLoading={postsData.isLoading}
              fetchNewPosts={postsData.fetchNextPage}
              hasMore={postsData.hasNextPage}
            />
          ) : (
            // <Comments comments={comments} commentData={commentsData} />
            <CommentRepliesProfile
              comments={comments}
              commentData={commentsData}
            />
          )}
        </div>
      </main>

      <ListUsersModal
        showModal={showModal}
        setShowModal={setShowModal}
        title={selectedModal === "followers" ? "Followers" : "Following"}
        users={
          selectedModal === "followers" ? user?.followers : user?.following
        }
      />
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
