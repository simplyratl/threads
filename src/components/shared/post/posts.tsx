import Image from "next/image";
import { api } from "~/utils/api";
import Post from "./post";
import Loading from "../loading";

function Posts() {
  const { data: posts, isLoading } = api.posts.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 180000, // 3 minutes in milliseconds
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <section className="flex-1 flex-shrink-0">
      <div className="mx-auto mb-4 block h-10 w-10 md:hidden">
        <Image
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi7cFYYdnIE7OeUJS72sOI4_CpDu-pywbSMjVN92DYgsSJKAmhHKiHKvgAZ6C7SCFavCwLeAwvQG2PH9CrVEj4b55sKuPUC5fhIUVk0SUS4k3OwGMosNz7Pr_HjE-pYE6gk1NY8L_Prf3r8LoivXBrPVbfj8_VNIuxHes7_Dme-SzKekL0h_X879lYMAI2s/w372-h413-p-k-no-nu/Threads%20Logo.png"
          fill
          alt="Logo"
          className={`inverted-logo !relative h-full w-full object-contain`}
        />
      </div>

      <div className="grid gap-8">
        {posts ? (
          posts.map((post, index) => (
            <div key={index}>
              <Post post={post} image={undefined} />
            </div>
          ))
        ) : (
          <span>No results</span>
        )}
      </div>
    </section>
  );
}

export default Posts;
