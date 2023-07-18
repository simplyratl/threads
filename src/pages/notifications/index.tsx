import { Notification, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "~/components/shared/loading";
import { api } from "~/utils/api";
import { formatToNowDate } from "~/utils/formatToNowDate";
import { GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

interface NotificationWithUser extends Notification {
  user: User;
  sender: User;
}

export default function NotificationsPage() {
  const { data: session } = useSession();

  const notificationsData =
    api.notifications.getNotificationsByUser.useInfiniteQuery(
      { userId: session?.user.id as string | null },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        enabled: !!session?.user,
      }
    );

  const notifications = notificationsData.data?.pages.flatMap(
    (page) => page.notifications
  );

  if (!session?.user) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl gap-16 px-4 md:ml-20 lg:ml-[34%] lg:p-0">
        <span className="text-lg text-foreground">
          You need to login to see notifications
        </span>
      </main>
    );
  }

  if (notificationsData.isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl gap-16 px-4 md:ml-20 lg:ml-[34%] lg:p-0">
        <Loading />
      </main>
    );
  }

  const formatNotificationType = (type: string) => {
    switch (type) {
      case "follow":
        return "followed you";
      case "like":
        return "liked your post";
      case "reply":
        return "replied to your post";
      case "reply_child":
        return "replied to your comment";
      case "mention":
        return "mentioned you in a post";
      case "repost":
        return "reposted your post";
      default:
        return "did something";
    }
  };

  function urlToNotification(notification: NotificationWithUser) {
    const { type } = notification;

    if (type === "follow") {
      return `/profile/${notification.sender.id}`;
    } else if (
      (type === "like" ||
        type === "reply" ||
        type === "reply_child" ||
        type === "repost") &&
      notification.postId
    ) {
      return `/thread/${notification.postId}`;
    }

    return "/";
  }

  return (
    <>
      <Head>
        <title>Threads | Notifications</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto min-h-screen max-w-2xl gap-16 px-4 md:ml-20 lg:ml-[34%] lg:p-0">
        <h1 className="text-3xl font-bold">Activity</h1>

        <div className="mt-3">
          <ul>
            <InfiniteScroll
              dataLength={notifications?.length ?? 0}
              next={notificationsData.fetchNextPage}
              hasMore={notificationsData.hasNextPage as boolean}
              loader={<Loading />}
              className="grid gap-4 !overflow-hidden"
              endMessage={
                <span className="mb-4 mt-2">No new notifications</span>
              }
            >
              {notifications &&
                notifications.length > 0 &&
                notifications.map((notification: NotificationWithUser) => (
                  <Link
                    href={urlToNotification(notification)}
                    key={notification.id}
                  >
                    <li className="flex w-full gap-3 rounded-lg pt-2 sm:px-4 sm:hover:bg-accent">
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={notification.sender.image as string}
                          alt={notification.sender.name as string}
                          fill
                          className="!relative h-full w-full object-cover"
                        />
                      </div>
                      <div className="w-full border-b border-accent pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold">
                            {notification.sender.name}
                          </h4>
                          <span className="text-sm text-foreground">
                            {formatToNowDate(new Date(notification.createdAt))}
                          </span>
                        </div>
                        <p className="m-0 text-base text-foreground">
                          {formatNotificationType(notification.type)}
                        </p>
                      </div>
                    </li>
                  </Link>
                ))}
            </InfiniteScroll>
          </ul>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
