import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import useClickOutside from "~/hooks/useClickOutside";
import { AnimatePresence, motion } from "framer-motion";

const MinimalDropdown = ({ children }: { children: React.ReactNode }) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const contentRef = React.useRef<HTMLLabelElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useClickOutside(dropdownRef, () => {
    setShowDropdown(false);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    toggleDropdown();
  };

  return (
    <div onClick={handleClick} className="relative">
      <label
        ref={contentRef}
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-foreground"
      >
        <HiOutlineDotsHorizontal size={24} />
      </label>
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.14, ease: "easeInOut", type: "tween" }}
            className="minimal-dropdown-ul absolute right-0 top-[calc(100%+8px)] z-10 flex w-44 flex-col rounded-lg bg-secondary p-2"
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MinimalDropdown;
