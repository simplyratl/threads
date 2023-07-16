import React from "react";
import HomeProfile from "~/components/home/home-profile";
import SearchInput from "~/components/search/search-input";

export default function SearchPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Search</h1>

      <div className="mt-8">
        <div className="mb-4">
          <SearchInput />
        </div>

        <HomeProfile showCurrentProfile={false} displayOnMobile />
      </div>
    </main>
  );
}
