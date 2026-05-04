import React, { useEffect, useRef, useState } from "react";
import { summaryData, stickyNotes, quizData } from "../data/mockData";

export default function StudentQuickTools() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
  };

  const isCorrect = selectedOption === quizData.answerIndex;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += `${event.results[i][0].transcript} `;
      }
      setSpokenText(text.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setVoiceError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleVoiceAssistant = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setVoiceError("Speech recognition is not supported in this browser.");
      return;
    }

    setVoiceError("");
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Viewer</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-gray-500">Attendance</div>
            <div className="text-xl font-black text-blue-600">{summaryData.attendance}</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3">
            <div className="text-gray-500">Avg Score</div>
            <div className="text-xl font-black text-indigo-600">{summaryData.averageScore}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-gray-500">Assignments</div>
            <div className="text-xl font-black text-green-600">{summaryData.assignmentsCompleted}</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <div className="text-gray-500">Pending</div>
            <div className="text-xl font-black text-amber-600">{summaryData.pendingTasks}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold">Upcoming:</span> {summaryData.upcomingQuiz}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sticky Notes Panel</h3>
        <div className="space-y-3">
          {stickyNotes.map((note) => (
            <div key={note.id} className="bg-yellow-100 rounded-xl p-3 border border-yellow-200">
              <div className="font-semibold text-gray-800">{note.title}</div>
              <div className="text-sm text-gray-700">{note.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quiz Section</h3>
        <p className="font-semibold text-gray-700 mb-3">{quizData.title}</p>
        <p className="text-sm text-gray-800 mb-3">{quizData.question}</p>
        <div className="space-y-2">
          {quizData.options.map((option, index) => (
            <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="quiz"
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
              />
              {option}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={handleQuizSubmit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Submit Answer
        </button>
        {submitted && (
          <div className={`mt-3 text-sm font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "Correct answer. Nice work!" : "Not correct. Try again."}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Voice Assistant</h3>
        <p className="text-sm text-gray-700 mb-3">Speak and your words will be detected below.</p>
        <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-800">
          {spokenText || "No voice input detected yet."}
        </div>
        {voiceError && <div className="mt-3 text-sm text-red-600">{voiceError}</div>}
        <button
          type="button"
          onClick={toggleVoiceAssistant}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold"
        >
          {isListening ? "Stop Listening" : "Start Voice Assistant"}
        </button>
        {isListening && <div className="mt-2 text-xs text-purple-700 font-semibold">Listening...</div>}
      </div>
    </div>
  );
}
