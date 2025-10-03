import React, { useContext, useEffect, useRef, useState } from "react";

import { BiMicrophone, BiSolidUser } from "react-icons/bi";
import Cookies from "js-cookie";
import { FaPause, FaPlay, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { IoIosSend } from "react-icons/io";
import { ConversationsContext } from "../context/ConversationsContext";
import { GiSoundWaves } from "react-icons/gi";

async function getAudioDurationFromBlob(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

  // useEffect(() => {
  //   if (!file) return;

  //   const fetchDuration = async () => {
  //     try {
  //       let blob;

  //       if (typeof file === "string") {
  //         const response = await fetch(file);
  //         if (!response.ok)
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         blob = await response.blob();
  //       } else if (file instanceof Blob) {
  //         blob = file;
  //       } else {
  //         console.error("Unsupported file format");
  //         return;
  //       }

  //       const durationFromBlob = await getAudioDurationFromBlob(blob);
  //       const calculatedDuration =
  //         durationFromBlob || calculateDurationFallback([blob]);
  //       setDisplayDuration(formatDuration(calculatedDuration));
  //     } catch (error) {
  //       console.error("Error", error);
  //     }
  //   };

  //   fetchDuration();
  // }, [file]);

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
    <div className="text-white flex items-center justify-between space-x-1 max-w-xs">
      <button
        onClick={togglePlay}
        className="p-2 bg-[#000] text-white rounded-full"
      >
        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
      </button>
      <span className="text-sm no-underline">
        {/* {duration} */}
        <GiSoundWaves className="text-4xl" />

        {/* / {displayDuration} */}
      </span>

      <audio
        ref={audioRef}
        src={typeof file === "string" ? file : file?.url}
        onEnded={() => {
          setIsPlaying(false);
          setDuration(displayDuration);
        }}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default function Chat({ isSidebarOpen }) {
  const { cId, jId } = useParams();
  const [messageText, setMessageText] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [voiceMsg, setVoiceMsg] = useState(null);
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
  const textareaRef = useRef(null);

  const { refreshConversations } = useContext(ConversationsContext);

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

        if (err.message === "Network Error" && !err.response) {
          window.location.reload(true);
        }
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

  useEffect(() => {
    if (voiceMsg && voiceMsg.url) {
      sendMessage();
    }
  }, [voiceMsg]);

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

  const createFileObject = async (blob) => {
    return new Promise((resolve) => {
      const file = new File([blob], "audio.mp3");
      resolve(file);
    });
  };

  const stopRecordingAndSend = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.stop();
    });

    setIsRecording(false);

    const audioBlob = new Blob(audioChunks);

    try {
      await sendAudio(audioBlob);
    } catch (error) {
      console.error("Error sending voice message: ", error);
    }

    mediaRecorderRef.current = null;
  };

  const sendAudio = async (audioBlob) => {
    const formData = new FormData();
    const token = Cookies.get("chatToken");

    formData.append("audio", audioBlob, "recording.mp3");

    try {
      const response = await fetch(
        "https://aichatbot-326159028339.us-central1.run.app/chat/conversation/voice",
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setVoiceMsg({ data: result, url: result.audioUrl });
        setHistory((prev) => {
          const updatedTextResponse = [
            ...prev.textReponse,
            {
              user: result.audioUrl,
              voice: true,
              chatbot: null,
            },
          ];
          return { ...prev, textReponse: updatedTextResponse };
        });
        sendMessage();
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

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
    if (!text && !voiceMsg) return;
    setLoadingChat(true);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.rows = 1;
      textarea.style.height = "auto";
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }

    const token = Cookies.get("chatToken");

    if (voiceMsg !== null) {
      const newMessage = {
        sender: "me",
        time: new Date().toISOString(),
        text: {
          text: voiceMsg.url,
          companyId: cId,
          jobId: jId,
        },
        file: null,
      };

      try {
        const messageResponse = await axios.post(
          "https://aichatbot-326159028339.us-central1.run.app/chat/conversation",
          newMessage.text,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const messageData = messageResponse.data;

        setHistory((prev) => {
          const updatedTextResponse = [
            ...prev.textReponse,
            { user: null, chatbot: messageData.textReponse },
          ];
          return { ...prev, textReponse: updatedTextResponse };
        });

        setVoiceMsg(null);
      } catch (error) {
        console.error("Error sending voice message as text: ", error);
        setLoadingChat(false);
      }

      setLoadingChat(false);
      return;
    }

    if (text) {
      const newMessage = {
        sender: "me",
        time: new Date().toISOString(),
        text: {
          text,
          companyId: cId,
          jobId: jId,
        },
        file: null,
      };

      setMessageText("");

      setHistory((prev) => {
        const updatedTextResponse = [
          ...prev.textReponse,
          { user: text, chatbot: null },
        ];
        return { ...prev, textReponse: updatedTextResponse };
      });

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
      } catch (error) {
        console.error("Error sending message: ", error);
        setLoadingChat(false);
      }
    }

    setLoadingChat(false);
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
  }, [history?.textReponse, loadingChat]);

  return (
    <div className="w-full flex flex-col h-full  relative">
      <div
        className={`flex-1 overflow-y-scroll p-4 space-y-4 md:space-y-8 pb-28 ${
          isSidebarOpen ? "md:px-[10%]" : "md:px-[20%]"
        } px-6`}
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
                    index % 2 === 0 ? "bg-white" : "bg-[#000] text-white"
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
              const isVoiceMessage = msg.user?.startsWith(
                "https://storage.googleapis.com/oneplace-voice/voice-uploads/"
              );

              return (
                <div
                  key={idx}
                  className={`flex items-end gap-3  ${
                    sender === "me" ? "justify-end" : "justify-start"
                  } group`}
                >
                  {sender === "them" && (
                    <div className="w-8 h-8 rounded-full relative border flex items-center justify-center bg-[#fff]">
                      {!history.avatar ? (
                        <img
                          src="/chatbot.jpeg"
                          alt={history.name}
                          className="w-full h-full object-cover rounded-full"
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
                    className={`relative max-w-[70%] md:max-w-md px-4 py-2 rounded-3xl shadow-custom text-sm transition-colors duration-300 flex flex-col  ${
                      sender === "me"
                        ? "bg-[#000] text-white"
                        : "bg-white text-[#000]"
                    }`}
                  >
                    {msg.chatbot && (
                      <p className="whitespace-pre-wrap break-words">
                        {msg.chatbot}
                      </p>
                    )}
                    {isVoiceMessage ? (
                      <VoiceMessage file={msg.user} />
                    ) : (
                      msg.user && (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.user}
                        </p>
                      )
                    )}
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
          <div className={`flex items-end gap-3 justify-start pt-4 mb-20`}>
            <div className="w-8 h-8 rounded-full relative border flex items-center justify-center bg-[#fff] shadow-xl">
              <img
                src={`/chatbot.jpeg`}
                alt={history.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div
              className={`flex space-y-2 px-4 py-3 rounded-3xl bg-white shadow-custom`}
            >
              <div className="flex items-center space-x-1 mt-1">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-dot-bounce-high"
                    style={{
                      animationDelay: `${dot * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`p-4 border flex-shrink-0 bg-[#fff] shadow-xl  ${
          isSidebarOpen ? "md:w-[80%]" : "md:w-[60%]"
        } w-[90%] rounded-3xl bg-none absolute bottom-4 left-1/2 transform -translate-x-1/2`}
      >
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
              className="bg-[#000] text-white px-4 py-2 rounded-full ml-2 md:text-base text-sm"
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

            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => {
                let value = e.target.value;

                while (value.startsWith("\n")) {
                  value = value.substring(1);
                }

                setMessageText(value);
              }}
              onInput={(e) => {
                const target = e.target;
                const maxRows = 3;
                target.rows = 1;

                const currentRows = target.scrollHeight / 24;
                target.rows = Math.min(Math.floor(currentRows), maxRows);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  sendMessage();
                  e.preventDefault();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full focus:outline-none bg-gray-100 md:text-base text-sm touch-none resize-none"
              style={{ touchAction: "manipulation" }}
              rows={1}
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
              className="bg-[#000] text-white p-2 rounded-full ml-2 md:text-base text-1xl"
            >
              <IoIosSend />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
