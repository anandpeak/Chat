import { useState } from "react";

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
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

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

export const Sidebar = ({
  conversations,
  changeConversation,
  cId,
  jId,
  setIsSidebarOpen,
  isSidebarOpen,
}) => {
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const navigate = useNavigate();

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
    <div className="w-full bg-white border-r h-screen flex flex-col py-4 justify-between">
      <div className="flex flex-col md:px-4 px-2">
        <div className="flex items-center justify-between pb-4 ">
          <button
            onClick={() => setIsSidebarOpen(false)}
            title="close sidebar"
            className={`px-2 p-1 hover:bg-[#000] hover:bg-opacity-10 rounded-xl ${
              !isSidebarOpen && "hidden"
            }`}
          >
            <img className="w-[30px] " src="/icon/sidebar.png" alt="icon" />
          </button>
          <button
            title="search chats"
            onClick={() => setShowSearchPopup(true)}
            className="px-3 p-2 hover:bg-[#000] hover:bg-opacity-10 rounded-xl text-[22px]"
          >
            <FaMagnifyingGlass />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations?.map((c, index) => (
            <div
              key={index}
              onClick={() => handleConversationClick(c)}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 gap-2 rounded-2xl ${
                cId === c.companyId && jId === c.jobId
                  ? "bg-[#000] bg-opacity-20"
                  : selectedConversation?.jobId === c.jobId
                  ? "bg-[#000] bg-opacity-20"
                  : ""
              }`}
            >
              {c.companyPhoto ? (
                <div className="w-10 h-10 rounded-full mr-3 relative border border-[#ccc]">
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
                  title={c.jobName}
                  className="font-semibold text-sm md:text-base max-w-[170px] md:max-w-[190px] truncate"
                >
                  {c.jobName}
                </p>
                <p
                  className="text-[10px] md:text-sm text-gray-500 max-w-[170px] md:max-w-[190px] truncate"
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

      {showSearchPopup && (
        <div
          className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50"
          onClick={() => setShowSearchPopup(false)}
        >
          <div
            className="bg-white rounded-xl w-[90%] md:w-[40%] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 py-3 border-b px-5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Messenger..."
                className="w-full md:text-base text-sm focus:outline-none"
              />

              <button
                className="md:px-3 ps-3 px-0 p-2 hover:bg-[#000] hover:bg-opacity-10 rounded-xl text-[22px]"
                onClick={() => setShowSearchPopup(false)}
              >
                <IoMdClose />
              </button>
            </div>

            <div className="mt-4 px-5 pb-4">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((c, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleConversationClick(c);
                      setShowSearchPopup(false);
                    }}
                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 gap-2 rounded-2xl"
                  >
                    {c.companyPhoto ? (
                      <div className="w-10 h-10 rounded-full mr-3 relative border border-[#ccc]">
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
                        className="font-semibold text-sm md:text-base max-w-[190px] md:max-w-[430px] truncate"
                      >
                        {c.jobName}
                      </p>
                      <p
                        className="text-[10px] md:text-sm text-gray-500 max-w-[190px] md:max-w-[430px] truncate"
                        title={c.companyName}
                      >
                        {c.companyName}
                      </p>
                    </div>

                    <span className="text-[8px] md:text-xs text-gray-400">
                      {formatTime(new Date())}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-lg">
                  No chat with the same name
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pe-4 border-t pt-4">
        <button
          onClick={() => {
            Cookies.remove("chatToken");

            navigate("/login");
          }}
          className="px-3 py-1 text-white bg-red-500 hover:bg-red-700 rounded-full  transition duration-300 ease-in-out md:text-lg text-base flex items-center gap-1"
        >
          <IoIosLogOut />
          Гарах
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
