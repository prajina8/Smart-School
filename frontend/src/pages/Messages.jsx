import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { Send, Search } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    const { data } = await api.get("/messages/conversations");
    setConversations(data.conversations);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/messages/${active.userId}`).then(({ data }) => setMessages(data.messages));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (active && (msg.sender === active.userId || msg.sender === active.userId?._id)) {
        setMessages((prev) => [...prev, msg]);
      }
      loadConversations();
    };
    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
    
  }, [socket, active]);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api.get(`/users?q=${q}`).then(({ data }) => setResults(data.users.filter((u) => u._id !== user._id)));
    }, 300);
    return () => clearTimeout(t);
  }, [q, user._id]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const { data } = await api.post("/messages", { recipientId: active.userId, content: text.trim() });
    setMessages((prev) => [...prev, data.message]);
    setText("");
    loadConversations();
  };

  const startConversation = (u) => {
    setActive({ userId: u._id, name: u.name, role: u.role });
    setQ("");
    setResults([]);
  };

  return (
    <div className="card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
      <div className="flex h-full">
        <div className="w-full sm:w-72 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 relative">
            <Search size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-8 text-sm"
              placeholder="Search people..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {results.length > 0 && (
              <div className="absolute left-3 right-3 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-56 overflow-y-auto">
                {results.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => startConversation(u)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                  >
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{u.role}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActive(c)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 ${
                  active?.userId === c.userId ? "bg-brand-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  {c.unread > 0 && (
                    <span className="bg-brand-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{c.lastMessage}</p>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-sm text-slate-400 p-4">Search for someone to start a conversation.</p>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Select a conversation to get started
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-medium text-slate-800">{active.name}</p>
                <p className="text-xs text-slate-400 capitalize">{active.role}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => {
                  const mine = m.sender === user._id || m.sender?._id === user._id;
                  return (
                    <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm ${
                          mine ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  className="input"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="btn-primary shrink-0">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
