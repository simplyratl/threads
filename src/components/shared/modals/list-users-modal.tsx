import React from "react";
import Modal from "~/components/modals/modal";
import { User } from "@prisma/client";
import SmallPostUser from "~/components/shared/post/small-post-user";
import Loading from "~/components/shared/loading";

interface ListUsersModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  users: any[] | undefined;
  isLoading?: boolean;
  isFetching?: boolean;
}

const ListUsersModal = ({
  setShowModal,
  showModal,
  title,
  users,
  isLoading,
  isFetching,
}: ListUsersModalProps) => {
  const loading = isLoading || isFetching;

  return (
    <Modal show={showModal} setShow={setShowModal} title={title}>
      <ul>
        {loading && <Loading />}
        {!loading && users && users.length === 0 && <span>Nothing found</span>}

        {users &&
          users.map((user) => (
            <li key={user.id}>
              <SmallPostUser
                id={user.id}
                username={user.name as string}
                avatar={user.image as string}
                big
                centeredText
              />
            </li>
          ))}
      </ul>
    </Modal>
  );
};

export default ListUsersModal;
