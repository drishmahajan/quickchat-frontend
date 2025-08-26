import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Picker from "emoji-picker-react";
import { UserCircle2, Send, Smile, Users, ArrowLeft, Copy, Share2, Info } from "lucide-react";

const socket = io("https://quickchat-backend-11.onrender.com");

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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-yellow-500 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <UserCircle2 className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-500 mb-2">Join Chat Cat</h2>
            <p className="text-gray-400">Enter your name to join the shadows</p>
            <p className="text-sm text-gray-500 mt-2">Room ID: {roomId}</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white rounded-xl focus:outline-none focus:border-yellow-500"
              maxLength={20}
              autoFocus
            />
            <button
              onClick={handleNameSubmit}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-3 rounded-xl"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-yellow-600 shadow px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-800 rounded-full">
              <ArrowLeft className="w-5 h-5 text-yellow-500" />
            </button>
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-8 h-8 text-yellow-500" />
              <div>
                <h2 className="font-bold text-yellow-400">Chat-Cat</h2>
                <p className="text-sm text-gray-400">Logged in as {username}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="text-sm bg-yellow-800 px-3 py-1 rounded-full text-yellow-300"
            >
              <Users className="w-4 h-4 inline mr-1" /> {users.length}
            </button>
            <button onClick={() => setShowRoomInfo(!showRoomInfo)} title="Room Info">
              <Info className="w-5 h-5 text-yellow-400" />
            </button>
            <button onClick={handleCopyLink} title="Copy Link">
              <Copy className="w-5 h-5 text-yellow-400" />
            </button>
            <button onClick={handleShareWhatsApp} title="Share via WhatsApp">
              <Share2 className="w-5 h-5 text-green-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Info */}
      {showRoomInfo && (
        <div className="bg-gray-800 border-b border-yellow-600 px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between">
            <div>
              <h3 className="font-semibold text-yellow-400">Room ID:</h3>
              <p className="text-sm text-gray-400">{roomId}</p>
            </div>
            <button
              onClick={handleCopyRoomId}
              className="text-sm bg-yellow-700 px-3 py-1 rounded-lg text-black font-bold"
            >
              Copy Room ID
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Body */}
      <div className="flex-1 flex max-w-4xl mx-auto w-full">
        {showUsers && (
          <div className="w-64 bg-gray-900 border-r border-yellow-600 p-4">
            <h3 className="font-semibold text-yellow-400 mb-3">Online Users</h3>
            <ul className="space-y-2">
              {users.map((user, idx) => (
                <li key={idx} className="text-sm flex items-center text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {user}
                  {user === username && <span className="text-yellow-400 ml-2">(You)</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.username === username ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-md break-words ${
                    msg.username === username
                      ? "bg-yellow-600 text-black font-medium"
                      : "bg-gray-800 text-gray-200 border border-gray-700"
                  }`}
                >
                  {msg.username !== username && (
                    <div className="text-xs font-semibold text-yellow-400 mb-1">{msg.username}</div>
                  )}
                  <div>{msg.message}</div>
                  <div className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="border-t border-yellow-600 bg-gray-900 p-4">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <button onClick={() => setShowEmoji(!showEmoji)}>
                <Smile className="w-5 h-5 text-yellow-400" />
              </button>
              <input
                type="text"
                className="flex-1 border-2 border-gray-700 bg-black text-white rounded-full px-4 py-2 focus:outline-none focus:border-yellow-500"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-4 py-2 rounded-full"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {showEmoji && (
              <div className="mt-2 bg-gray-900 border border-yellow-600 rounded-lg p-2">
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
