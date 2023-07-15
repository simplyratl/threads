import React from "react";
import HomeProfile from "~/components/home/home-profile";

export default function SearchPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 md:ml-20 lg:ml-[34%] lg:p-0">
      <h1 className="text-3xl font-bold">Search</h1>

      <div className="mt-8">
        <HomeProfile showCurrentProfile={false} />
      </div>
    </main>
  );
}
