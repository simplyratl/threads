import React from 'react';
import {api} from "~/utils/api";

const AlertTopBar = () => {
  const {data:alert, isLoading} = api.alerts.getAlert.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  if (isLoading || !alert) return null;

  return (
    <div className="max-h-[320px]:bg-red-500 bg-accent rounded-xl px-4 py-2 flex items-center justify-center lg:max-w-[34rem] mb-4 md:m-0 overflow-hidden">
      <span className="text-base font-semibold whitespace-break-spaces break-words text-center">
        {alert.content}
      </span>
    </div>
  );
};

export default AlertTopBar;