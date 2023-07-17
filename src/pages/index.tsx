import { motion, useScroll } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useRef } from "react";
import HomeProfile from "~/components/home/home-profile";
import Posts from "~/components/shared/post/posts";
import { api } from "~/utils/api";
import AlertTopBar from "~/components/shared/alert-top-bar";
import { Alert } from ".prisma/client";

export default function Home() {
  const logoRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: logoRef,
    offset: ["35%", "5%"],
  });

  const postsData = api.posts.infinitePosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  const posts: any = postsData.data?.pages.flatMap((page) => page.posts);

  return (
    <>
      <Head>
        <title>Threads</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto min-h-screen max-w-lg px-4 md:ml-auto lg:ml-[34%] lg:max-w-4xl lg:p-0">
        <div>
          <AlertTopBar />
        </div>

        <div className="mx-auto block h-10 w-10 md:hidden">
          <motion.div
            ref={logoRef}
            style={{ opacity: scrollYProgress, scale: scrollYProgress }}
          >
            <Image
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7cFYYdnIE7OeUJS72sOI4_CpDu-pywbSMjVN92DYgsSJKAmhHKiHKvgAZ6C7SCFavCwLeAwvQG2PH9CrVEj4b55sKuPUC5fhIUVk0SUS4k3OwGMosNz7Pr_HjE-pYE6gk1NY8L_Prf3r8LoivXBrPVbfj8_VNIuxHes7_Dme-SzKekL0h_X879lYMAI2s/w372-h413-p-k-no-nu/Threads%20Logo.png"
              fill
              alt="Logo"
              className={`inverted-logo !relative h-full w-full object-contain`}
            />
          </motion.div>
        </div>
        <div className="mt-6 flex w-full gap-16">
          <Posts
            posts={posts}
            isLoading={postsData.isLoading}
            fetchNewPosts={postsData.fetchNextPage}
            hasMore={postsData.hasNextPage}
          />
          <HomeProfile displayOnMobile={false} />
        </div>
      </main>
    </>
  );
}

// export function getServerSideProps() {
//   const { data: alert } = api.alerts.getAlert.useQuery(undefined, {
//     refetchOnWindowFocus: false,
//     staleTime: Infinity,
//     cacheTime: Infinity,
//   });
//
//   return {
//     props: {
//       alert,
//     },
//   };
// }
