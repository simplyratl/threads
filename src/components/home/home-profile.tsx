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

  const { data: recommendedUsers } = api.users.getRecommendedUsers.useQuery(
    { userId: user?.id as string },
    {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <div className="hidden h-full w-[320px] flex-shrink-0 lg:block">
      <div>
        {user && (
          <div className="mb-2">
            <PostUser
              id={user.id}
              avatar={user.image as string}
              username={user.name as string}
              verified={verified?.verified ?? false}
            />
          </div>
        )}
        <div>
          <h4 className="mb-4">Suggested for you</h4>
          <ul className="flex flex-col gap-4">
            {recommendedUsers &&
              recommendedUsers.map((recommendedUser, index) => (
                <li key={index}>
                  <PostUser
                    id={recommendedUser.id}
                    avatar={recommendedUser.image as string}
                    username={recommendedUser.name as string}
                    verified={recommendedUser.verified}
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
