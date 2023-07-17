import React from "react";
import { User } from "@prisma/client";

const ReplyAvatar = ({
  count,
  images,
}: {
  count: number;
  images: string[];
}) => {
  function size() {
    if (count === 1) return "h-6 w-6";
    else if (count === 2) return "h-5 w-5";
    else return "";
  }

  function positionAvatar(index: number) {
    if (count === 1) return "left-0";
    if (count === 2) return index === 0 ? "left-1" : "-left-1";

    if (index === 0) return "left-1 top-0 w-4 h-4 h-3 w-3";
    else if (index === 1) return "left-1 top-3 h-2.5 w-2.5";
    else if (index === 2) return "left-0 -top-1.5 h-4 w-4";
    else return "left-0";
  }

  return (
    <>
      {images.map((avatar, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-full ${size()} ${positionAvatar(
            index
          )}`}
        >
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </>
  );
};

const ReplyAvatars = ({
  users,
}: {
  users: {
    user: {
      image: string;
    };
  }[];
}) => {
  const flattenedImages = users ? users.map((user) => user.user.image) : [];

  const SIZE = flattenedImages.length;

  return (
    <>
      {SIZE > 0 && (
        <div className="flex h-11 w-full items-center justify-center">
          <ReplyAvatar count={SIZE} images={flattenedImages} />
        </div>
      )}
    </>
  );
};

export default ReplyAvatars;
