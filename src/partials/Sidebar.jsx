import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import {
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  isThisWeek,
  isYesterday,
} from "date-fns";
import { BiSolidUser } from "react-icons/bi";

const formatTime = (raw) => {
  if (typeof raw !== "string") return "";

  const date = new Date(
    raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3").replace(" ", "T")
  );

  const now = new Date();

  if (isNaN(date)) return "";

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

export const Sidebar = ({ conversations, changeConversation }) => {
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    changeConversation(
      parseInt(conversation.companyId),
      parseInt(conversation.jobId)
    );
  };

  const filteredConversations = conversations
    ? conversations.filter((c) =>
        c.jobName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="w-full bg-white border-r h-screen flex flex-col">
      <div className="p-4 border-b h-[65px] relative flex items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Messenger"
          className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus:outline-none"
        />
        <FiSearch className="absolute left-8 text-gray-400" />
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((c, index) => (
          <div
            key={index}
            onClick={() => handleConversationClick(c)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 border-b gap-2 ${
              selectedConversation?.jobId === c.jobId ? "bg-gray-200" : ""
            }`}
          >
            {c.companyPhoto ? (
              <div className="w-10 h-10 rounded-full mr-3 relative border">
                <img
                  src={c.companyPhoto}
                  alt={c.companyName}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            ) : (
              <div className="h-10 w-10 border rounded-full flex items-center justify-center">
                <BiSolidUser className="m-0 cursor-pointer w-[30px] h-[30px] text-[#666874]" />
              </div>
            )}

            <div className="flex-1 gap-2">
              <p
                title={`${c.jobName}`}
                className="font-semibold text-sm md:text-base max-w-[220px] truncate"
              >
                {c.jobName}
              </p>
              <p
                className="text-[10px] md:text-sm text-gray-500 max-w-[180px] truncate"
                title={c.companyName}
              >
                {c.companyName}
              </p>
            </div>

            <span className="text-[8px] md:text-xs text-gray-400">
              {formatTime(new Date())}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
