import React, { useEffect, useState } from "react";
import Modal from "~/components/modals/modal";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Button from "~/components/shared/ui/button";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

const AddUsernameModal = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const [username, setUsername] = useState("");

  const checkUsername = api.users.checkIfUsernameTaken.useMutation({
    onSuccess: (taken) => {
      if (taken.taken) {
        toast.error("Username already taken.", {
          id: "username_change_error",
        });
      } else {
        changeUsername.mutate({ username });
      }
    },
  });

  const changeUsername = api.users.changeUsername.useMutation({
    onSuccess: () => {
      toast.success("Username changed successfully.");
      setShowModal(false);
      router.reload();
    },
    onError: () => {
      toast.error("Error changing username.", {
        id: "username_change_error",
      });
    },
  });

  const getIfUserHasUsername = () => {
    if (session?.user) {
      return session.user.username === null;
    } else {
      return false;
    }
  };

  useEffect(() => {
    setShowModal(getIfUserHasUsername());
  }, [session]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters long.", {
        id: "username_change_error",
      });
      return;
    }

    const usernameRegex =
      /^(?!.*\.\.)(?!.*\_\_)(?!.*\.\_)(?!.*\_\.)[a-zA-Z0-9._]{1,30}$/;
    if (!usernameRegex.test(username)) {
      const rules = [
        /^(?!.*\.\.)/,
        /^(?!.*\_\_)/,
        /^(?!.*\.\_)/,
        /^(?!.*\_\.)[a-zA-Z0-9._]{1,30}$/,
      ];
      const errorMessages = [
        "Consecutive periods (..) are not allowed.",
        "Consecutive underscores (__) are not allowed.",
        "Username cannot end with a period followed by an underscore (._).",
        "Invalid characters. Only letters, numbers, periods, and underscores are allowed. Length must be between 1 and 30 characters.",
      ];

      for (let i = 0; i < rules.length; i++) {
        if (!rules[i]?.test(username)) {
          toast.error(
            errorMessages[i] ?? "Error creating username. Try different one.",
            {
              id: "username_change_error",
            }
          );
          return;
        }
      }
    }

    checkUsername.mutate({ username });
  };

  return (
    <Modal
      show={showModal}
      setShow={setShowModal}
      title="Change username"
      disableHideModal
    >
      <form onSubmit={(e) => void handleSubmit(e)}>
        <div className="font-semibold">
          <h2 className="text-lg">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            It looks like you still don't have your username.
          </h2>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-sm">Let's create it.</p>
        </div>

        <div className="mt-8">
          <label className="mb-0.5 block font-semibold">Username</label>
          <div className="relative flex w-full items-center rounded-lg border-2 border-foreground px-2 ring-foreground transition-all focus-within:ring-2">
            <div className="h-full select-none border-r-2 border-foreground py-2 pl-2 pr-4 font-bold text-foreground">
              @
            </div>
            <input
              type="text"
              className="w-full bg-transparent px-2 py-2 outline-none "
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="minimal" className="text-lg" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUsernameModal;
