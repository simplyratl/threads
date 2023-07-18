import React from "react";
import { Alert } from "@prisma/client";

const AlertTopBar = ({ alert }: { alert: any }) => {
  if (!alert) return null;

  return (
    <div className="max-h-[320px]:bg-red-500 mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-accent px-4 py-2 md:m-0 lg:w-[calc(100%-360px)]">
      <span className="whitespace-break-spaces break-words text-center text-base font-semibold">
        {alert.content}
      </span>
    </div>
  );
};

export default AlertTopBar;
