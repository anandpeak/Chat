import { createContext, useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export const ConversationsContext = createContext();

export const ConversationsProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshConversations = useCallback(() => {
    const token = Cookies.get("chatToken");

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
            navigate(`/chat/${newCId}/${newJId}`);
          }
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.pathname, navigate]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  return (
    <ConversationsContext.Provider
      value={{ conversations, refreshConversations, loading }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};
