import { differenceInMilliseconds } from "date-fns";

export const formatToNowDate = (date: Date) => {
  // Get the current date and time
  const now = new Date();

  // Calculate the difference between the dates in milliseconds
  const diff = differenceInMilliseconds(now, date);

  // If the difference is less than 1 minute, return "just now"
  if (diff < 60000) {
    return "just now";
  }

  // If the difference is less than 1 hour, return the number of minutes
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  }

  // If the difference is less than 1 day, return the number of hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} h`;
  }

  // If the difference is less than 1 week, return the number of days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} d`;
  }

  // If the difference is less than 1 month, return the number of weeks
  if (diff < 2592000000) {
    const weeks = Math.floor(diff / 604800000);
    return `${weeks} w`;
  }

  // Otherwise, return the number of months
  const months = Math.floor(diff / 2592000000);
  return `${months} m`;
};
