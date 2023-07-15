import {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  type NextPage,
} from "next";
import { api } from "~/utils/api";
import { ssgHelper } from "~/utils/ssg";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: user } = api.users.getByID.useQuery({ id });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl gap-16 px-4 md:ml-20 lg:ml-[38%] lg:p-0 lg:pt-8">
      profile {user?.name}
    </main>
  );
};

export const getStaticProps = async (
  context: GetStaticPathsContext<{ id: string }>
) => {
  const id = context.params?.id;

  if (id === null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();

  await ssg.users.getByID.prefetch({ id });

  return {
    props: {
      id,
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
