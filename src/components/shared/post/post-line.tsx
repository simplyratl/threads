import React from "react";

interface PostLineProps {
  fullHeight?: boolean;
}

const PostLine = ({ fullHeight = false }: PostLineProps) => {
  return (
    <div
      className={`relative left-1/2 top-0 mt-2 w-0.5 -translate-x-1/2 bg-accent transition-all duration-200 group-hover:bg-foreground`}
      style={{
        height: !fullHeight ? "calc(100% - 5rem)" : "calc(100% - 3rem)",
      }}
    ></div>
  );
};

export default PostLine;
