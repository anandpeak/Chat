import { BiSolidUser } from "react-icons/bi";
import { motion } from "framer-motion";
import { IoIosArrowBack } from "react-icons/io";

export const Header = ({
  activeConversation,
  setIsSidebarOpen,
  isSidebarOpen,
}) => {
  return (
    <div
      className={`flex items-center p-4 ${
        isSidebarOpen ? "border-b" : "bg-gray-50 md:border-none border-b"
      } h-[65px] gap-2`}
    >
      <motion.div
        className={`flex items-center gap-1 ${isSidebarOpen ? "hidden" : ""}`}
        initial={{ x: -20, opacity: 1 }}
        animate={{
          x: isSidebarOpen ? -20 : 0,
          opacity: isSidebarOpen ? 0 : 1,
        }}
        exit={{ x: -20, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <motion.button
          onClick={() => setIsSidebarOpen(true)}
          title="open sidebar"
          className={`p-1 hover:bg-[#000] hover:bg-opacity-10 rounded-full ${
            isSidebarOpen ? "cursor-default" : "cursor-pointer"
          }`}
        >
          <IoIosArrowBack className="text-[24px]" />
        </motion.button>
      </motion.div>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-3 relative">
          {activeConversation?.companyPhoto ? (
            <div className="w-10 h-10 rounded-full mr-3 relative border border-[#ccc]">
              <img
                src={activeConversation?.companyPhoto}
                alt={activeConversation?.companyName}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          ) : (
            <div className="h-10 w-10 border rounded-full flex items-center justify-center">
              <BiSolidUser className="m-0 cursor-pointer w-[30px] h-[30px] text-[#666874]" />
            </div>
          )}
          {activeConversation?.status === "Active now" && (
            <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
              <div className="bg-green-400 w-2 h-2 rounded-full"></div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <p className="font-semibold max-w-[160px] md:max-w-[160px] truncate">
            {activeConversation?.companyName}
          </p>
          <img className="w-4 h-4" src="/verified.png" alt="verified" />
          {/* <p className="text-sm">{activeConversation.status}</p> */}
        </div>
      </div>
    </div>
  );
};
