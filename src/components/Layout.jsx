import React, { useContext, useState, useCallback, useEffect } from "react";
import { ConversationsContext } from "../context/ConversationsContext";
import { Sidebar } from "../partials/Sidebar";
import { Header } from "../partials/Header";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { motion, AnimatePresence } from "framer-motion";

export const Layout = ({ children }) => {
  const { cId, jId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Accessing context
  const { conversations, loading } = useContext(ConversationsContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const changeConversation = (cId, jId) => {
    const targetPath = `/chat/${cId}/${jId}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const activeConversation = conversations.find(
    (conv) =>
      parseInt(conv.companyId) === parseInt(cId) &&
      parseInt(conv.jobId) === parseInt(jId)
  );

  if (!loading) return <Loading />;

  return (
    <div className="flex h-[calc(var(--vh,1vh)*100)] font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: "-100%", width: "0%" }}
            animate={{
              x: 0,
              width: isMobile ? "300px" : "30%", // Adjust width based on device
            }}
            exit={{ x: "-100%", width: "0%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-30 bg-white border-r overflow-y-auto md:relative md:translate-x-0"
          >
            <Sidebar
              conversations={conversations}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              changeConversation={changeConversation}
              cId={cId}
              jId={jId}
            />
          </motion.div>
        )}

        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#000] z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col w-full">
        <Header
          activeConversation={activeConversation}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="w-full bg-gray-50 h-[90%] md:h-[92%]">
          {React.cloneElement(children, { isSidebarOpen })}
        </div>
      </div>
    </div>
  );
};
