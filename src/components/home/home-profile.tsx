import { useSession } from "next-auth/react";
import React from "react";
import PostUser from "../shared/post/post-user";
import { api } from "~/utils/api";

export default function HomeProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  const { data: verified } = api.users.getIfVerified.useQuery(
    { username: user?.name as string },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <div className="hidden h-full w-[320px] flex-shrink-0 lg:block">
      <div>
        <div>
          {user && (
            <PostUser
              id={user.id}
              avatar={user.image as string}
              username={user.name as string}
              verified={verified?.verified ?? false}
            />
          )}
        </div>
        <div className="mt-2">
          <h4 className="mb-4">Suggested for you</h4>
          <ul className="flex flex-col gap-4">
            {user &&
              new Array(5).fill(0).map((_, index) => (
                <li key={index}>
                  <PostUser
                    id={user.id}
                    avatar={user.image as string}
                    username={user.name as string}
                    verified={verified?.verified ?? false}
                    small
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
