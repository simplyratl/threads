import { useSession } from "next-auth/react";
import Head from "next/head";
import React, { useRef, useState } from "react";
import PostUser from "~/components/shared/post/post-user";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import Button from "~/components/shared/button";
import TextareaAutosize from "react-textarea-autosize";
import { HiPaperClip } from "react-icons/hi2";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";
import ReactPlayer from "react-player";
import VideoPlayer from "~/components/shared/video-player";
import SmallPostUser from "~/components/shared/post/small-post-user";

const CDNURL =
  "https://wxhaoxtosehvuuitysfj.supabase.co/storage/v1/object/public/multimedia/";

export default function ThreadsNew() {
  const { data: session } = useSession();
  const supabase = useSupabaseClient();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState<string>("");

  const [blockSending, setBlockSending] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const createPost = api.posts.create.useMutation({
    onSuccess: (post) => {
      setContent("");
      toast.success("Post created");
      setIsSubmitting(false);
      setFile(null);
      setFilePreview(null);
    },
    onError: (error) => {
      toast.error(error.message, { id: "post-error" });
      setIsSubmitting(false);
      setBlockSending(true);
      setFile(null);
      setFilePreview(null);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (blockSending)
      return toast.error(
        "You are not allowed to post threads at the moment. Please try again later.",
        {
          id: "post-error",
        }
      );

    if (!content)
      return toast.error("Post cannot be empty", {
        id: "post-empty",
      });

    if (!file) {
      setIsSubmitting(true);
      createPost.mutate({
        content,
      });
      return;
    }

    uploadImage()
      .then((url) => {
        if (!url) return;

        const multimediaType = isImage(file) ? "IMAGE" : "VIDEO";

        setIsSubmitting(true);
        createPost.mutate({
          content,
          multimediaURL: url,
          multimediaType: multimediaType,
        });
      })
      .catch((error) => {
        return toast.error(error.message, { id: "image-upload-error" });
      });
  };

  if (!session?.user) return null;

  const uploadImage = async () => {
    if (!file) return;

    const { data, error } = await supabase.storage
      .from("multimedia")
      .upload(`${session.user.id}/${uuidv4()}`, file);

    if (error) {
      toast.error(error.message, { id: "image-upload-error" });
      return Promise.reject(error);
    }

    return `${CDNURL}/${data?.path}`;
  };

  const isImage = (file: File) => {
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/bmp"];
    return imageTypes.includes(file.type);
  };

  const isVideo = (file: File) => {
    const videoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
    ];
    return videoTypes.includes(file.type);
  };

  return (
    <>
      <Head>
        <title>Threads | New Thread</title>
        <meta name="description" content="Create a new thread" />
      </Head>
      <main className="mx-auto min-h-screen max-w-2xl px-4 md:ml-20 lg:ml-[38%] lg:p-0">
        <form onSubmit={handleSubmit}>
          <div className="w-full">
            {session?.user && (
              <SmallPostUser
                id={session?.user.id}
                avatar={session.user.image as string}
                username={session.user.name as string}
              />
            )}
            <div className="mt-8">
              <TextareaAutosize
                className="w-full resize-none rounded border border-border_color bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-foreground"
                placeholder="Start a thread..."
                value={content}
                disabled={isSubmitting}
                onChange={(event) => setContent(event.target.value)}
                maxLength={500}
              />

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

            <div className="mt-4 flex justify-end">
              <Button disabled={isSubmitting} type="submit">
                Post
              </Button>
            </div>
          </div>

          {file && (
            <div className="mt-8 w-full cursor-pointer overflow-hidden rounded-xl lg:w-fit">
              {isImage(file) ? (
                <img
                  className="h-full w-full object-cover"
                  src={filePreview ?? ""}
                  alt="Preview of image"
                />
              ) : isVideo(file) ? (
                <VideoPlayer url={filePreview} />
              ) : null}
            </div>
          )}

          <input
            type="file"
            hidden
            className="hidden"
            ref={fileInputRef}
            accept="image/*,video/mp4"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) return;

              setFile(file ?? null);
              const reader = new FileReader();
              reader.onload = (e) => {
                // Access the file preview URL
                const previewUrl = e.target?.result;
                // Display the preview image
                setFilePreview(previewUrl as string);
              };
              reader.readAsDataURL(file);
            }}
          />
        </form>
      </main>
    </>
  );
}
