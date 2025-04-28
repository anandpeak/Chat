import React from "react";
import {
  format,
  isYesterday,
  isThisWeek,
  differenceInMinutes,
  differenceInHours,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

const formatTime = (raw) => {
  const date = new Date(
    raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3").replace(" ", "T")
  );
  const now = new Date();

  if (isNaN(date)) return "Invalid date";

  const mins = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);
  const years = differenceInYears(now, date);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  if (weeks < 2) return "Last week";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

const Sidebar = ({ conversations, setChat, chat }) => {
  return (
    <div>
      <div className="p-4 border-b h-[65px]">
        <input
          type="text"
          placeholder="Search Messenger"
          className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
        />
      </div>
      {conversations.map((c) => (
        <div
          key={c.id}
          onClick={() => setChat(c.id)}
          className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b ${
            chat === c.id ? "bg-gray-100" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full mr-3 relative">
            <img
              src={c.avatar}
              alt={c.name}
              className="w-full h-full object-contain rounded-full"
            />
            {c.status === "Active now" && (
              <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                <div className="bg-green-400 w-2 h-2 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex-1 gap-2">
            <p className="font-semibold text-sm md:text-base">{c.name}</p>
            <p className="text-[10px] md:text-sm text-gray-500 overflow-hidden whitespace-nowrap truncate">
              {c.lastMessage}
            </p>
          </div>
          <span className="text-[8px] md:text-xs text-gray-400">
            {formatTime(c.time)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
