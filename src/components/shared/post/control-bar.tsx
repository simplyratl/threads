import {
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineSend,
} from "react-icons/ai";
import { api } from "~/utils/api";

type ControlBarProps = {
  postId: string;
  likes: number;
};

function ControlBar({ postId, likes }: ControlBarProps) {
  const trpcUtils = api.useContext();

  const toggleLike = api.posts.toggleLike.useMutation({
    onSuccess: (addedLike) => {
      const updateData: Parameters<
        typeof trpcUtils.posts.infinitePosts.setInfiniteData
      >[1] = (oldData) => {
        if (!oldData) return;

        const countModifier = addedLike.liked ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    _count: {
                      ...post._count,
                      likes: post._count.likes + countModifier,
                    },
                  };
                }

                return post;
              }),
            };
          }),
        };
      };

      trpcUtils.posts.infinitePosts.setInfiniteData({}, updateData);
    },
  });

  function handleLike() {
    toggleLike.mutate({ postId });
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="cursor-pointer hover:opacity-60">
          <div
            className="cursor-pointer hover:opacity-60"
            onClick={() => handleLike()}
          >
            <AiOutlineHeart className="h-7 w-7" />
          </div>
        </div>
        <div className="cursor-pointer hover:opacity-60">
          <AiOutlineMessage className="h-6 w-6" />
        </div>
        <div className="cursor-pointer hover:opacity-60">
          <AiOutlineSend className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-2">
        <span className="font-semibold text-foreground">{likes} likes</span>
      </div>
    </div>
  );
}

export default ControlBar;
