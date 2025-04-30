import React, { useEffect, useRef, useState } from "react";

import { BiMenu, BiMicrophone } from "react-icons/bi";
import conversations from "../json/conversation.json";

import { FaTrash } from "react-icons/fa";
import Sidebar from "../partials/Sidebar";

const replies = [
  "That's interesting!",
  "Tell me more.",
  "Haha, good one!",
  "Let me think about it.",
  "Absolutely!",
  "I'm not sure about that.",
  "Cool!",
  "Sounds good.",
];

export default function Chat() {
  const [chat, setChat] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const [convos, setConvos] = useState(conversations);

  const maxFileSize = 25 * 1024 * 1024;
  const fileInputRef = useRef(null);

  const currentChat = convos.find((c) => c.id === chat);

  useEffect(() => {
    let timer;

    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      alert("File is too large. Please upload a file under 25MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        name: file.name,
        type: file.type,
        url: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Stream:", stream);

      const recorder = new MediaRecorder(stream);
      console.log("Recorder:", recorder);

      recorder.ondataavailable = (e) => {
        setAudioChunks((prev) => {
          const updatedChunks = [...prev, e.data];
          console.log("Audio Chunks:", updatedChunks);
          return updatedChunks;
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
    }
  };

  const stopRecordingAndSend = () => {
    if (!mediaRecorder) return;

    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      console.log("Recording stopped, creating audioBlob...");
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log("Audio Blob Created:", audioBlob);

      const audioFile = {
        name: `audio-${Date.now()}.webm`,
        type: "audio/webm",
        url: audioUrl,
      };

      setPendingAttachment(audioFile);
      sendMessage();
    };

    setIsRecording(false);
    setMediaRecorder(null);
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // 🛑 Stop microphone
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setAudioChunks([]);
    setIsRecording(false);
  };

  const sendMessage = () => {
    if (!messageText.trim() && !pendingAttachment) return;
    console.log("Pending Attachment:", pendingAttachment); // Debugging line

    const newMessage = {
      sender: "me",
      time: new Date().toISOString(),
    };

    if (messageText.trim()) {
      newMessage.text = messageText.trim();
    }

    if (pendingAttachment) {
      newMessage.file = pendingAttachment;
    }

    setConvos((prev) =>
      prev.map((c) =>
        c.id === chat
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: messageText || pendingAttachment?.name,
              time: new Date().toISOString(),
            }
          : c
      )
    );

    setMessageText("");
    setPendingAttachment(null);

    setTimeout(() => {
      const reply = replies[Math.floor(Math.random() * replies.length)];

      const replyMessage = {
        text: reply,
        sender: "them",
        time: new Date().toISOString(),
      };

      setConvos((prev) =>
        prev.map((c) =>
          c.id === chat
            ? {
                ...c,
                messages: [...c.messages, replyMessage],
                lastMessage: reply,
                time: new Date().toISOString(),
              }
            : c
        )
      );
    }, 1500);
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r overflow-y-auto transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-1/4
        `}
      >
        <Sidebar setChat={setChat} chat={chat} conversations={conversations} />
      </div>

      {/* Overlay when sidebar open on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Chat window */}
      <div className="flex flex-col w-full">
        {/* Header */}
        {currentChat && (
          <div className="flex items-center justify-between p-4 border-b h-[65px]">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full mr-3 relative">
                <img
                  src={currentChat.avatar}
                  alt={currentChat.name}
                  className="w-full h-full object-contain rounded-full"
                />
                {currentChat.status === "Active now" && (
                  <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                    <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{currentChat.name}</p>
                <p className="text-sm">{currentChat.status}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-2xl mr-4 md:hidden"
            >
              <BiMenu />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {currentChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-3 ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              } group`}
            >
              {msg.sender === "them" && (
                <div className="w-8 h-8 rounded-full relative">
                  <img
                    src={currentChat.avatar}
                    alt={currentChat.name}
                    className="w-full h-full object-contain rounded-full"
                  />
                  {currentChat.status === "Active now" && (
                    <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                      <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`relative max-w-[70%] md:max-w-md px-4 py-2 rounded-3xl shadow text-sm transition-colors duration-300 flex flex-col ${
                  msg.sender === "me"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.file && (
                  <div className="mt-1">
                    {msg.file.type.startsWith("image/") && (
                      <img
                        src={msg.file.url}
                        alt="uploaded"
                        className="max-w-xs rounded-lg"
                      />
                    )}
                    {msg.file.type.startsWith("video/") && (
                      <video controls className="max-w-xs rounded-lg">
                        <source src={msg.file.url} type={msg.file.type} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {msg.file && msg.file.type.startsWith("audio/") && (
                      <audio controls className="w-full mt-2">
                        <source src={msg.file.url} type={msg.file.type} />
                        Your browser does not support the audio element.
                      </audio>
                    )}

                    {!msg.file.type.startsWith("image/") &&
                      !msg.file.type.startsWith("video/") && (
                        <a
                          href={msg.file.url}
                          download={msg.file.name}
                          className="underline"
                        >
                          {msg.file.name}
                        </a>
                      )}
                  </div>
                )}
              </div>

              {msg.sender === "me" && (
                <div className="w-8 h-8 rounded-full relative">
                  <img
                    src={currentChat.avatar}
                    alt={currentChat.name}
                    className="w-full h-full object-contain rounded-full"
                  />
                  {currentChat.status === "Active now" && (
                    <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                      <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          {pendingAttachment && (
            <div className="mb-2 flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white">
              {pendingAttachment.type.startsWith("image/") && (
                <img
                  src={pendingAttachment.url}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              {pendingAttachment.type.startsWith("video/") && (
                <video className="w-16 h-16 rounded" controls>
                  <source
                    src={pendingAttachment.url}
                    type={pendingAttachment.type}
                  />
                </video>
              )}
              {!pendingAttachment.type.startsWith("image/") &&
                !pendingAttachment.type.startsWith("video/") && (
                  <p className="text-sm">{pendingAttachment.name}</p>
                )}
              <button
                onClick={() => setPendingAttachment(null)}
                className="text-red-500 text-sm hover:underline"
              >
                ❌
              </button>
            </div>
          )}

          {isRecording ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={cancelRecording}
                className="text-red-400 text-base md:text-2xl p-2"
                title="Cancel Recording"
              >
                <FaTrash />
              </button>
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Timer */}
                <div className="text-red-500 font-semibold text-sm md:text-lg">
                  {formatTime(recordingTime)}
                </div>
                {/* Moving Dots Animation */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:.2s]"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:.4s]"></div>
                </div>
              </div>
              <button
                onClick={stopRecordingAndSend}
                className="bg-blue-500 text-white px-4 py-2 rounded-full ml-2 md:text-base text-sm"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <>
                <input
                  type="file"
                  accept="image/*,video/*,application/pdf,application/msword,.doc,.docx,.xls,.xlsx"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-blue-600 text-xl hover:bg-gray-100 rounded-full w-[32px] h-[32px] flex items-center justify-center p-3"
                >
                  📎
                </button>
              </>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full border focus:outline-none bg-gray-100 md:text-base text-sm"
              />
              <button
                className={`text-blue-600 text-xl hover:bg-gray-100 rounded-full w-[32px] h-[32px] flex items-center justify-center `}
                title={"Hold to Record"}
                onClick={startRecording}
              >
                <BiMicrophone />
              </button>

              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-full ml-2 md:text-base text-sm"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
