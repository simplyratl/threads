import { useSession } from "next-auth/react";
import React from "react";
import PostUser from "../shared/post/post-user";
import { api } from "~/utils/api";
import SmallPostUser from "~/components/shared/post/small-post-user";

interface Props {
  showCurrentProfile?: boolean;
  displayOnMobile?: boolean;
}

export default function HomeProfile({
  showCurrentProfile = true,
  displayOnMobile = false,
}: Props) {
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
    <div
      className={`h-full w-[260px] pr-12 ${
        displayOnMobile ? "block" : "hidden lg:block"
      }`}
    >
      <div>
        {showCurrentProfile && user && (
          <div className="mb-2">
            <SmallPostUser
              id={user.id}
              username={user.name as string}
              avatar={user.image as string}
              verified={user.verified ?? false}
              big
            />
          </div>
        )}
        <div>
          <h4 className="font-semibold text-foreground">Suggested for you</h4>
          <ul className="flex flex-col gap-2">
            {recommendedUsers &&
              recommendedUsers.map((recommendedUser, index) => (
                <li key={index}>
                  <SmallPostUser
                    id={recommendedUser.id}
                    avatar={recommendedUser.image as string}
                    username={recommendedUser.name as string}
                    verified={recommendedUser.verified}
                  />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
