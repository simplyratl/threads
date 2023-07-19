import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "~/components/shared/loading";

interface DropdownProps {
  showDropdown: boolean;
  setShowDropdown?: (showDropdown: boolean) => void;
  children?: React.ReactNode;
  noResults?: boolean;
  heading: string;
  returnedData: unknown[] | undefined;
  top?: string;
}

interface RenderListProps {
  isFetching: boolean;
  children: React.ReactNode;
  showDropdown: boolean;
  isLoading: boolean;
}

export const RenderListDropdown = ({
  children,
  isFetching,
  showDropdown,
  isLoading,
}: RenderListProps) => {
  if (isFetching)
    return (
      <div className="flex h-full w-full items-center justify-center pb-6">
        <Loading />
      </div>
    );

  if (showDropdown) {
    return (
      <div className="w-full">
        {!isLoading && (
          <ul className="flex w-full flex-col justify-center">{children}</ul>
        )}
      </div>
    );
  }
};

const Dropdown = ({
  showDropdown,
  setShowDropdown,
  noResults,
  heading,
  returnedData,
  children,
  top,
}: DropdownProps) => {
  const hasData = returnedData && returnedData.length > 0;

  return (
    <AnimatePresence>
      {showDropdown && (
        <motion.div
          className={`absolute left-0 ${
            top ?? "top-[calc(100%+8px)]"
          } z-10 h-full max-h-[390px] min-h-[80px] w-full rounded-xl bg-accent`}
          style={{
            overflow: hasData ? "auto" : "hidden",
            height: hasData ? "auto" : "fit-content",
          }}
          initial={{ opacity: 0.6, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.6, y: 10 }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
        >
          <h3 className="p-4 text-lg font-medium text-foreground">{heading}</h3>

          <div>{children}</div>

          {noResults && (
            <p className="p-4 text-sm text-foreground">No results found</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dropdown;
