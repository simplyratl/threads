import React from "react";
import { api } from "~/utils/api";

const AlertTopBar = () => {
  const { data: alert, isLoading } = api.alerts.getAlert.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (isLoading || !alert) return null;

  return (
    <div className="max-h-[320px]:bg-red-500 mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-accent px-4 py-2 md:m-0 lg:w-[calc(100%-360px)]">
      <span className="whitespace-break-spaces break-words text-center text-base font-semibold">
        {alert.content}
      </span>
    </div>
  );
};

export default AlertTopBar;
