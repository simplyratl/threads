import React, { useEffect, useRef, useState } from "react";
import PostUser from "~/components/shared/post/post-user";
import { useSession } from "next-auth/react";
import Button from "~/components/shared/button";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import { api } from "~/utils/api";
import { User } from "@prisma/client";
import Loading from "~/components/shared/loading";
import { AnimatePresence, motion } from "framer-motion";

const SearchInput = () => {
  const { data: session } = useSession();

  const [search, setSearch] = useState("");
  const [deboncedSearch] = useDebounce(search, 1000);

  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    data: users,
    isLoading,
    isFetching,
  } = api.users.searchUsers.useQuery(
    {
      search: deboncedSearch,
    },
    {
      enabled: deboncedSearch.length > 2,
    }
  );

  const hasUsers = users && users.length > 0;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputFocus = () => {
    setSearch("");
    setShowDropdown(true);
  };

  const displaySearchResults = (content: string) => {
    return (
      <div className="flex h-full pb-2">
        <span className="px-4 text-sm font-semibold text-foreground">
          {content}
        </span>
      </div>
    );
  };

  const renderList = () => {
    if (isFetching)
      return (
        <div className="flex h-full w-full items-center justify-center pb-6">
          <Loading />
        </div>
      );

    if (showDropdown) {
      return (
        <>
          {users && users.length > 0 && deboncedSearch.length < 2 && (
            <span>Search</span>
          )}

          {!isLoading && (
            <ul>
              {users &&
                users.map((user: User) => (
                  <li className="" key={user.id}>
                    <Link
                      href={`/profile/${user.id}`}
                      className="flex items-center justify-between  px-6 py-2 hover:bg-background"
                    >
                      <div className="relative -left-1">
                        <PostUser
                          id={user.id}
                          username={user.name as string}
                          avatar={user.image as string}
                          small
                        />
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </>
      );
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        ref={inputRef}
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => handleInputFocus()}
        onBlur={() => setShowDropdown(false)}
        value={search}
        className="w-full rounded-xl border-none bg-accent px-4 py-2 outline-none placeholder:font-semibold focus:ring-2"
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className={`absolute left-0 top-[calc(100%+8px)] z-10 h-full max-h-[390px] min-h-[60px] w-full rounded-xl bg-accent`}
            style={{
              overflow: hasUsers ? "auto" : "hidden",
              height: hasUsers ? "auto" : "fit-content",
            }}
            initial={{ opacity: 0.6, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.6, y: 10 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            <h4 className="mb-2 px-4 pt-2 text-base font-bold text-foreground">
              Search for users and threads
            </h4>

            {(!users || users.length === 0) &&
              displaySearchResults("No results found")}
            {renderList()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
