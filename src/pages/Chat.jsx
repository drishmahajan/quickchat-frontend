import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Picker from "emoji-picker-react";
import { UserCircle2, Send, Smile, Users, ArrowLeft, Copy, Share2, Info } from "lucide-react";

const socket = io("https://quickchat-backend-pczv.onrender.com");

function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [showNamePrompt, setShowNamePrompt] = useState(!localStorage.getItem("username"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const messagesEndRef = useRef(null);

  const handleNameSubmit = () => {
    if (!username.trim()) {
      alert("Please enter your name!");
      return;
    }
    localStorage.setItem("username", username.trim());
    setShowNamePrompt(false);
  };

  useEffect(() => {
    if (!roomId || !roomId.match(/^[0-9a-fA-F\-]{36}$/)) {
      alert("Invalid Room ID format. Redirecting to home page.");
      navigate("/");
      return;
    }

    if (!showNamePrompt && username) {
      socket.emit("join-room", roomId, username);

      socket.on("chat-history", (history) => setMessages(history));
      socket.on("receive-message", ({ message, username, timestamp }) => {
        setMessages((prev) => [...prev, { message, username, timestamp }]);
      });
      socket.on("update-users", (userList) => setUsers(userList));
      socket.on("room-error", (error) => {
        alert(`Room error: ${error}`);
        navigate("/");
      });

      return () => {
        socket.off("receive-message");
        socket.off("update-users");
        socket.off("chat-history");
        socket.off("room-error");
      };
    }
  }, [roomId, username, showNamePrompt, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      message: input.trim(),
      username,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, msg]);
    socket.emit("send-message", { roomId, ...msg });
    setInput("");
    setShowEmoji(false);
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert("Room ID copied to clipboard!");
    } catch {
      alert("Failed to copy Room ID.");
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      alert("Room link copied! Share it with others to join this chat.");
    } catch {
      alert("Failed to copy link.");
    }
  };

  const handleShareWhatsApp = () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    const message = `Hey! Join our chat room on QuickChat: ${link}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const win = window.open(whatsappURL, "_blank");
    if (!win) alert("Popup blocked. Allow popups to share via WhatsApp.");
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <UserCircle2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Chat Room</h2>
            <p className="text-gray-600">Enter your name to join the conversation</p>
            <p className="text-sm text-gray-500 mt-2">Room ID: {roomId}</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              maxLength={20}
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="font-bold text-gray-800">QuickChat</h2>
                <p className="text-sm text-gray-500">Logged in as {username}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUsers(!showUsers)} className="text-sm bg-blue-100 px-3 py-1 rounded-full text-blue-700">
              <Users className="w-4 h-4 inline mr-1" /> {users.length}
            </button>
            <button onClick={() => setShowRoomInfo(!showRoomInfo)} title="Room Info">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleCopyLink} title="Copy Link">
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleShareWhatsApp} title="Share via WhatsApp">
              <Share2 className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Info */}
      {showRoomInfo && (
        <div className="bg-yellow-50 border-b px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Room ID:</h3>
              <p className="text-sm text-gray-600">{roomId}</p>
            </div>
            <button onClick={handleCopyRoomId} className="text-sm bg-yellow-200 px-3 py-1 rounded-lg">
              Copy Room ID
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Body */}
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {showUsers && (
          <div className="w-64 bg-white border-r p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Online Users</h3>
            <ul className="space-y-2">
              {users.map((user, idx) => (
                <li key={idx} className="text-sm flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {user}
                  {user === username && <span className="text-blue-500 ml-2">(You)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.username === username ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-md break-words ${msg.username === username ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow-sm"}`}>
                  {msg.username !== username && (
                    <div className="text-xs font-semibold text-blue-600 mb-1">{msg.username}</div>
                  )}
                  <div>{msg.message}</div>
                  <div className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <button onClick={() => setShowEmoji(!showEmoji)}>
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2 focus:outline-none"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-full"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {showEmoji && (
              <div className="mt-2">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
