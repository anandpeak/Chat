import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../partials/Sidebar";
import { Header } from "../partials/Header";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export const Layout = ({ children }) => {
  const { cId, jId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigateToChat = useCallback(
    (cId, jId) => {
      const targetPath = `/chat/${cId}/${jId}`;
      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }
    },
    [location.pathname, navigate]
  );

  useEffect(() => {
    const token = localStorage.getItem("chatToken");

    axios
      .get(`https://aichatbot-326159028339.us-central1.run.app/chat/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((data) => {
        const conversations = data.data.data;
        setConversations(conversations);

        if (conversations.length > 0 && location.pathname === "/chat") {
          const firstConversation = conversations[0];
          const newCId = firstConversation?.companyId;
          const newJId = firstConversation?.jobId;

          if (newCId && newJId) {
            navigateToChat(parseInt(newCId), parseInt(newJId));
          }
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.pathname, navigateToChat]);

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

  if (loading) return <Loading />;

  return (
    <div className="flex h-screen font-sans">
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r overflow-y-auto transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-[30%]
        `}
      >
        <Sidebar
          conversations={conversations}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          changeConversation={changeConversation}
        />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col w-full">
        <Header
          activeConversation={activeConversation}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="w-full h-[90%] md:h-[92%]">{children}</div>
      </div>
    </div>
  );
};
