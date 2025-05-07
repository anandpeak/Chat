import React, { useEffect, useRef, useState } from "react";

import { BiSolidUser } from "react-icons/bi";
import Cookies from "js-cookie";
import { FaPause, FaPlay, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const VoiceMessage = ({ file }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [displayDuration, setDisplayDuration] = useState("0:00");

  const formatDuration = (seconds) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (file?.duration) {
      setDisplayDuration(formatDuration(file.duration));
    }
  }, [file]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isFinite(audio.duration) && audio.duration > 0) {
      setDuration(formatDuration(audio.duration));
      setDisplayDuration(formatDuration(audio.duration));
    } else if (file?.duration) {
      setDisplayDuration(formatDuration(file.duration));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (isFinite(audio.currentTime)) {
        setDuration(formatDuration(audio.currentTime));
      }
    };

    if (isPlaying) {
      audio.addEventListener("timeupdate", updateTime);
      return () => audio.removeEventListener("timeupdate", updateTime);
    }
  }, [isPlaying]);

  return (
    <div className=" text-white flex items-center justify-between space-x-3 max-w-xs">
      <button
        onClick={togglePlay}
        className="p-2 bg-blue-500 text-white rounded-full"
      >
        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
      </button>
      <span className="text-sm no-underline">
        {isPlaying ? duration : displayDuration}
      </span>

      <audio
        ref={audioRef}
        src={file?.url}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setDuration(displayDuration);
        }}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default function Chat() {
  const { cId, jId } = useParams();
  const [messageText, setMessageText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [history, setHistory] = useState(null);

  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);

  const chatContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  const maxFileSize = 25 * 1024 * 1024;
  const fileInputRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    const token = Cookies.get("chatToken");
    axios
      .get(
        `https://aichatbot-326159028339.us-central1.run.app/chat/init/${cId}/${jId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((data) => {
        setHistory(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [cId, jId]);

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
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current = recorder;
      setAudioChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecordingAndSend = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.stop();
    });

    setIsRecording(false);

    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);

    const durationFromMetadata = await new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration) && audio.duration > 0) {
          resolve(audio.duration);
        } else {
          resolve(null);
        }
      };
      audio.onerror = () => resolve(null);
    });

    let duration = durationFromMetadata;
    if (!durationFromMetadata) {
      duration = await getAudioDurationFromBlob(audioBlob);
    }

    if (!duration || !isFinite(duration)) {
      console.warn("Could not determine duration accurately, using fallback");
      duration = calculateDurationFallback(audioChunks);
    }

    console.log("Final Duration:", duration);

    const audioFile = {
      name: `audio-${Date.now()}.webm`,
      type: "audio/webm",
      url: audioUrl,
      duration: duration,
    };

    setPendingAttachment(audioFile);
    sendMessage();
    mediaRecorderRef.current = null;
  };

  async function getAudioDurationFromBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    try {
      const decodedData = await audioContext.decodeAudioData(arrayBuffer);
      return decodedData.duration;
    } catch (error) {
      console.error("Error decoding audio:", error);
      return null;
    }
  }

  function calculateDurationFallback(chunks) {
    const totalBytes = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const approximateBitrate = 4000;
    return totalBytes / approximateBitrate;
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setAudioChunks([]);
    setIsRecording(false);
  };

  const sendMessage = async () => {
    const text = messageText.trim();

    setMessageText("");

    if (!text && !pendingAttachment) return;

    const newMessage = {
      sender: "me",
      time: new Date().toISOString(),
      text: null,
      file: null,
    };

    if (text) {
      newMessage.text = {
        text,
        companyId: cId,
        jobId: jId,
      };
    }

    if (pendingAttachment) {
      newMessage.file = pendingAttachment;
    }

    setHistory((prev) => {
      const updatedTextResponse = [
        ...prev.textReponse,
        { user: text, chatbot: null },
      ];

      return { ...prev, textReponse: updatedTextResponse };
    });

    const token = Cookies.get("chatToken");

    setLoadingChat(true);
    try {
      const response = await axios.post(
        "https://aichatbot-326159028339.us-central1.run.app/chat/conversation",
        newMessage.text,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      setHistory((prev) => {
        const updatedTextResponse = [
          ...prev.textReponse,
          { user: null, chatbot: data.textReponse },
        ];

        return { ...prev, textReponse: updatedTextResponse };
      });

      setLoadingChat(false);
    } catch (error) {
      console.error("Error sending message: ", error);
      setLoadingChat(false);
    }

    setPendingAttachment(null);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // Scroll to the most recent user message
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      } else {
        // Scroll to the most recent user message
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [history?.textReponse]);

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      <div
        className="flex-1 overflow-y-scroll p-4 space-y-4 md:space-y-2"
        ref={chatContainerRef}
      >
        {loading ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                {index % 2 === 0 && (
                  <div className="w-8 h-8">
                    <Skeleton circle width={32} height={32} />
                  </div>
                )}

                <div
                  className={`flex-1 space-y-2 max-w-[70%] md:max-w-md px-4 py-2 rounded-3xl ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-500 text-white"
                  }`}
                >
                  <Skeleton width="80%" height={16} />
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={16} />
                </div>

                {index % 2 !== 0 && (
                  <div className="w-8 h-8">
                    <Skeleton circle width={32} height={32} />
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          history?.textReponse
            ?.filter((msg) => msg.chatbot || msg.user)
            .map((msg, idx) => {
              const sender = msg.chatbot ? "them" : "me";

              return (
                <div
                  key={idx}
                  className={`flex items-end gap-3 ${
                    sender === "me" ? "justify-end" : "justify-start"
                  } group`}
                >
                  {sender === "them" && (
                    <div className="w-8 h-8 rounded-full relative border flex items-center justify-center bg-[#fff]">
                      {history.avatar ? (
                        <img
                          src={history.avatar}
                          alt={history.name}
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <BiSolidUser className="m-0 cursor-pointer w-[25px] h-[25px] text-[#666874]" />
                      )}
                      {history.status === "Active now" && (
                        <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                          <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`relative max-w-[70%] md:max-w-md px-4 py-2 rounded-3xl shadow text-sm transition-colors duration-300 flex flex-col ${
                      sender === "me"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {msg.chatbot && <p>{msg.chatbot}</p>}
                    {msg.user && <p>{msg.user}</p>}

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
                        {msg.file.type.startsWith("audio/") && (
                          <VoiceMessage file={msg.file} />
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

                  {sender === "me" && (
                    <div className="w-8 h-8 rounded-full relative border flex items-center justify-center bg-[#fff]">
                      {history.avatar ? (
                        <img
                          src={history.avatar}
                          alt={history.name}
                          className="w-full h-full object-contain rounded-full"
                        />
                      ) : (
                        <BiSolidUser className="m-0 cursor-pointer w-[25px] h-[25px] text-[#666874]" />
                      )}
                      {history.status === "Active now" && (
                        <div className="w-3 h-3 rounded-full bg-[#fff] flex items-center justify-center absolute bottom-0 right-0">
                          <div className="bg-green-400 w-2 h-2 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
        )}
        {loadingChat && (
          <div className={`flex items-end gap-3 justify-start pt-4`}>
            <div className="w-8 h-8 rounded-full relative border flex items-center justify-center bg-[#fff]">
              <BiSolidUser className="m-0 cursor-pointer w-[25px] h-[25px] text-[#666874]" />
            </div>

            <div
              className={`flex-1 space-y-2 max-w-[70%] md:max-w-md px-4 py-2 rounded-3xl bg-white`}
            >
              <Skeleton width="80%" height={16} />
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t bg-none flex-shrink-0`}>
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
          <div className={`flex items-center gap-2`}>
            <>
              {/* <input
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
              </button> */}
            </>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full border focus:outline-none bg-gray-100 md:text-base text-sm"
            />
            {/* <button
              className={`text-blue-600 text-xl hover:bg-gray-100 rounded-full w-[32px] h-[32px] flex items-center justify-center `}
              title={"Hold to Record"}
              onClick={startRecording}
            >
              <BiMicrophone />
            </button> */}

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
  );
}
