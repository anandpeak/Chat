import { BiMenu, BiSolidUser } from "react-icons/bi";

export const Header = ({ activeConversation, setIsSidebarOpen }) => {
  return activeConversation ? (
    <div className="flex items-center justify-between p-4 border-b h-[65px]">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-3 relative">
          {activeConversation.companyPhoto ? (
            <div className="w-10 h-10 rounded-full mr-3 relative border">
              <img
                src={activeConversation.companyPhoto}
                alt={activeConversation.companyName}
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
        <div>
          <p className="font-semibold">{activeConversation?.companyName}</p>
          {/* <p className="text-sm">{activeConversation.status}</p> */}
        </div>
      </div>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="text-2xl mr-4 md:hidden"
      >
        <BiMenu />
      </button>
    </div>
  ) : null;
};
