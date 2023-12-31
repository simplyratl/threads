import { useSession } from "next-auth/react";
import React from "react";
import PostUser from "../shared/post/post-user";
import { api } from "~/utils/api";
import SmallPostUser from "~/components/shared/post/small-post-user";
import { GetServerSidePropsContext } from "next";
import { ssgHelper } from "~/utils/ssg";
import { User } from "@prisma/client";

interface Props {
  showCurrentProfile?: boolean;
  displayOnMobile?: boolean;
  recommendedUsers?: User[];
}

export default function HomeProfile({
  showCurrentProfile = true,
  displayOnMobile = false,
  recommendedUsers,
}: Props) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div
      className={`h-full w-[260px] pr-12 ${
        displayOnMobile ? "block" : "hidden lg:block"
      }`}
    >
      {user && (
        <div>
          {showCurrentProfile && user && (
            <div className="mb-2">
              <SmallPostUser
                id={user.id}
                username={user.username ?? (user.name as string)}
                avatar={user.image as string}
                verified={user?.verified}
                big
                centeredText
              />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-foreground">Suggested for you</h4>
            <ul className="flex flex-col gap-0.5">
              {recommendedUsers &&
                recommendedUsers.map((recommendedUser, index) => (
                  <li key={index}>
                    <SmallPostUser
                      id={recommendedUser.id}
                      avatar={recommendedUser.image as string}
                      username={
                        recommendedUser
                          ? (recommendedUser.username as string) ??
                            (recommendedUser.name as string)
                          : "unknown"
                      }
                      verified={recommendedUser.verified}
                      centeredText
                    />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
