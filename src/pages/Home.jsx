import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { MessageCircle, Users, Share2, Copy, Key } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      alert("Please enter your name first!");
      return;
    }

    setIsLoading(true);
    const newRoomId = uuidv4();
    localStorage.setItem("username", username.trim());
    const fullLink = `${window.location.origin}/chat/${newRoomId}`;

    try {
      await navigator.clipboard.writeText(fullLink);
      alert(
        `Room created successfully!\n\nRoom ID: ${newRoomId}\n\nFull link copied to clipboard! Share it with others to chat together.`
      );
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = fullLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert(
        `Room created successfully!\n\nRoom ID: ${newRoomId}\n\nFull link copied to clipboard! Share it with others to chat together.`
      );
    }

    setIsLoading(false);
    navigate(`/chat/${newRoomId}`);
  };

  const validateRoomId = (id) => {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      id
    );
  };

  const cleanRoomId = (input) => {
    let id = input.trim();
    if (id.includes("http")) {
      const parts = id.split("/");
      id = parts[parts.length - 1];
    }
    return id.replace(/[^a-fA-F0-9-]/g, "");
  };

  const handleJoinByInput = () => {
    if (!username.trim()) {
      alert("Please enter your name first!");
      return;
    }

    const cleaned = cleanRoomId(roomId);
    if (!validateRoomId(cleaned)) {
      alert("Invalid Room ID format. Please check the ID and try again.");
      return;
    }

    localStorage.setItem("username", username.trim());
    navigate(`/chat/${cleaned}`);
  };

  const handleJoinByPrompt = () => {
    if (!username.trim()) {
      alert("Please enter your name first!");
      return;
    }

    let inputRoomId = prompt("Paste the Room link or Room ID:");
    if (!inputRoomId) return;

    const cleaned = cleanRoomId(inputRoomId);
    if (!validateRoomId(cleaned)) {
      alert("Invalid Room ID format. Please check the link/ID and try again.");
      return;
    }

    localStorage.setItem("username", username.trim());
    navigate(`/chat/${cleaned}`);
  };

  const handleShareWhatsApp = async () => {
    if (!username.trim()) {
      alert("Please enter your name first!");
      return;
    }

    setIsLoading(true);
    const newRoomId = uuidv4();
    localStorage.setItem("username", username.trim());

    const link = `${window.location.origin}/chat/${newRoomId}`;
    const message = `Hey! Join our chat room on QuickChat: ${link}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.log("Clipboard write failed");
    }

    const win = window.open(whatsappURL, "_blank");
    if (!win) {
      alert(
        "Popup blocked! Please allow popups or manually share this link:\n\n" +
          link
      );
    }

    setTimeout(() => {
      setIsLoading(false);
      navigate(`/chat/${newRoomId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-yellow-500 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-3 rounded-full shadow-lg">
              <MessageCircle className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-yellow-500 mb-2 tracking-wider">
            Chat-Cat
          </h1>
          <p className="text-gray-400">Chat in the shadows of the Cat </p>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300"
            maxLength={20}
          />
        </div>

        {/* Room ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Room ID (optional)
          </label>
          <input
            type="text"
            placeholder="Paste Room ID or link here"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-700 bg-black text-white rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-5 h-5" />
            {isLoading ? "Creating..." : "Create Room & Copy Link"}
          </button>

          <button
            onClick={handleJoinByInput}
            disabled={!roomId.trim()}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Key className="w-5 h-5" />
            Join Room
          </button>

          <button
            onClick={handleJoinByPrompt}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join via Prompt
          </button>

          <button
            onClick={handleShareWhatsApp}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {isLoading ? "Sharing..." : "Create & Share via WhatsApp"}
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-800 rounded-xl text-sm text-yellow-400 border border-yellow-600">
          <h3 className="font-semibold text-yellow-500 mb-2">
            How it works:
          </h3>
          <ul className="space-y-1">
            <li>• Enter your name and create a room</li>
            <li>• Copy and share the Room link</li>
            <li>• Others can join with the Room ID</li>
            <li>• Start chatting instantly in the Batcave!</li>
          </ul>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        😼Secure • Fast • Cat Ready🐱
      </footer>
    </div>
  );
}

export default Home;
