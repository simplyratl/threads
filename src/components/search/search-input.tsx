import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import { api } from "~/utils/api";
import { User } from "@prisma/client";
import SmallPostUser from "~/components/shared/post/small-post-user";
import Dropdown, {
  RenderListDropdown,
} from "~/components/shared/dropdowns/dropdown";

const SearchInput = () => {
  const { data: session } = useSession();

  const [search, setSearch] = useState("");
  const [deboncedSearch] = useDebounce(search, 800);

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

  const handleInputFocus = () => {
    setSearch("");
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    setShowDropdown(false);
    setSearch("");
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        ref={inputRef}
        placeholder="Search"
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => handleInputFocus()}
        onBlur={() => handleInputBlur()}
        value={search}
        className="w-full rounded-xl border-none bg-accent px-4 py-2 outline-none placeholder:font-semibold focus:ring-2"
      />

      <Dropdown
        showDropdown={showDropdown}
        heading="Search users"
        noResults={users && users.length === 0}
        returnedData={users}
      >
        <RenderListDropdown
          showDropdown={showDropdown}
          isLoading={isLoading}
          isFetching={isFetching}
        >
          {users &&
            users.map((user: User) => (
              <li className="" key={user.id}>
                <Link
                  href={`/profile/${user.username as string}`}
                  className="flex items-center justify-between px-6 py-2 hover:bg-background"
                >
                  <div className="relative -left-1">
                    <SmallPostUser
                      id={user.id}
                      username={
                        (user.username as string) ?? (user.name as string)
                      }
                      avatar={user.image as string}
                      classNameContainer="!py-1"
                    />
                  </div>
                </Link>
              </li>
            ))}
        </RenderListDropdown>
      </Dropdown>
    </div>
  );
};

export default SearchInput;
