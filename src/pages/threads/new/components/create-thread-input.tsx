import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Button from "~/components/shared/button";
import { HiPaperClip } from "react-icons/hi2";
import Dropdown, {
  RenderListDropdown,
} from "~/components/shared/dropdowns/dropdown";
import { useDebounce } from "use-debounce";
import { api } from "~/utils/api";
import { User } from "@prisma/client";
import SmallPostUser from "~/components/shared/post/small-post-user";

interface CreateThreadInputProps {
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

const CreateThreadInput = ({
  fileInputRef,
  content,
  setContent,
  isSubmitting,
}: CreateThreadInputProps) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [mentionText, setMentionText] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [debouncedMentionText] = useDebounce(mentionText, 500);

  const {
    data: recommendedUsers,
    isLoading,
    isFetching,
  } = api.users.searchUsers.useQuery(
    {
      search: debouncedMentionText,
    },
    {
      refetchOnMount: false,
      enabled: debouncedMentionText.length > 1,
    }
  );

  const getLastMention = (value: string) => {
    const mentions = value.match(/@\w+/g);
    return mentions ? mentions.pop() : "";
  };

  const noResults = recommendedUsers?.length === 0 && !isLoading && !isFetching;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setContent(value);

    const words = value.split(/\s+/);
    const lastWord = words[words.length - 1];
    if (lastWord?.startsWith("@")) {
      // If the lastWord starts with "@", update the mentionText to the current mention
      const currentMention = getLastMention(value)?.substring(1) || "";
      setMentionText(currentMention);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative mt-8">
      <div className="relative">
        <TextareaAutosize
          className="w-full resize-none rounded border border-border_color bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-foreground"
          placeholder="Start a thread..."
          value={content}
          disabled={isSubmitting}
          onChange={handleChange}
          maxLength={500}
          ref={inputRef}
        />
        <Dropdown
          heading="Mention"
          noResults={noResults}
          returnedData={recommendedUsers?.filter(
            (user: User) =>
              (user.name &&
                user.name.toLowerCase().includes(mentionText.toLowerCase())) ||
              (user.username &&
                user.username.toLowerCase().includes(mentionText.toLowerCase()))
          )}
          showDropdown={showDropdown}
          top="calc(100%)"
        >
          {showDropdown && (
            <RenderListDropdown
              showDropdown={showDropdown}
              isLoading={isLoading}
              isFetching={isFetching}
            >
              {recommendedUsers &&
                recommendedUsers.map((user: User) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-6 py-2 hover:bg-background"
                      onClick={() => {
                        setMentionText("");
                        setContent(
                          `${content.substring(
                            0,
                            content.lastIndexOf("@") + 1
                          )}${
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            user?.username ??
                            user.name?.toLowerCase().replace(" ", ".")
                          } `
                        );
                        setShowDropdown(false);
                        inputRef.current && inputRef.current.focus();
                      }}
                    >
                      <div className="relative -left-1">
                        <SmallPostUser
                          id={user.id}
                          username={
                            (user.username as string) ?? (user.name as string)
                          }
                          avatar={user.image as string}
                          classNameContainer="!py-1"
                          disableLink
                        />
                      </div>
                    </button>
                  </li>
                ))}
            </RenderListDropdown>
          )}
        </Dropdown>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <Button
          variant="minimal"
          className="!p-0 text-black dark:text-white"
          onClick={() => fileInputRef.current?.click()}
        >
          <HiPaperClip size={24} />
        </Button>

        <span className="text-sm font-semibold text-foreground">
          {content.length}/500
        </span>
      </div>
    </div>
  );
};

export default CreateThreadInput;
