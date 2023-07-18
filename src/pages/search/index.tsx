import React from "react";
import HomeProfile from "~/components/home/home-profile";
import SearchInput from "~/components/search/search-input";
import { GetServerSidePropsContext } from "next";
import { ssgHelper } from "~/utils/ssg";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

export default function SearchPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: recommendedUsers } = api.users.getRecommendedUsers.useQuery(
    { userId: user?.id as string },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Search</h1>

      <div className="mt-8">
        <div className="mb-4">
          <SearchInput />
        </div>

        <HomeProfile
          showCurrentProfile={false}
          displayOnMobile
          recommendedUsers={recommendedUsers}
        />
      </div>
    </main>
  );
}
