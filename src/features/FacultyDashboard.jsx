import React, { useEffect, useMemo, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { attendanceChart, performanceChart, facultyUploads } from "../data/mockData";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function FacultyDashboard({ currentUser, onLogout }) {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState(facultyUploads);
  const [contentText, setContentText] = useState("");
  const [summary, setSummary] = useState("");
  const [stickyPoints, setStickyPoints] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [quizResult, setQuizResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [facultyCount, setFacultyCount] = useState(3);
  const [classDuration, setClassDuration] = useState(1);
  const [workdayStart, setWorkdayStart] = useState(9);
  const [workdayEnd, setWorkdayEnd] = useState(17);
  const [timetableMessage, setTimetableMessage] = useState("");
  const [generatedTimetable, setGeneratedTimetable] = useState([]);
  const [facultyInputs, setFacultyInputs] = useState([
    { name: "Dr. Asha", subjects: "Math, Statistics", weeklyHours: 8 },
    { name: "Prof. Ravi", subjects: "Physics, Electronics", weeklyHours: 10 },
    { name: "Dr. Neha", subjects: "CS, AI", weeklyHours: 12 },
  ]);

  useEffect(() => {
    setFacultyInputs((prev) => {
      const next = [...prev];
      const target = Math.max(1, Number(facultyCount) || 1);
      while (next.length < target) {
        const idx = next.length + 1;
        next.push({
          name: `Faculty ${idx}`,
          subjects: idx % 2 === 0 ? "Physics, Chemistry" : "Math, CS",
          weeklyHours: 8,
        });
      }
      return next.slice(0, target);
    });
  }, [facultyCount]);

  const stopWords = useMemo(
    () =>
      new Set([
        "the",
        "is",
        "are",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "for",
        "with",
        "on",
        "by",
        "at",
        "as",
        "it",
        "this",
        "that",
        "from",
        "be",
        "was",
        "were",
        "can",
        "will",
        "we",
        "you",
      ]),
    []
  );

  const splitSentences = (text) =>
    text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 25);

  const topKeywords = (text, count = 4) => {
    const frequency = {};
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .forEach((word) => {
        if (!word || word.length < 4 || stopWords.has(word)) return;
        frequency[word] = (frequency[word] || 0) + 1;
      });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  };

  const generateQuiz = (text) => {
    const sentences = splitSentences(text);
    const sentence = sentences[0] || text.slice(0, 140);
    const words = sentence
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const answer = words[0] || "content";
    const options = [answer, "analysis", "summary", "insight"].sort(() => Math.random() - 0.5);
    const question = sentence.replace(new RegExp(`\\b${answer}\\b`, "i"), "_____");

    return {
      question: question.length > 15 ? question : `Which term best matches the uploaded content?`,
      options,
      answer,
    };
  };

  const generateArtifacts = (text) => {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentences = splitSentences(clean);
    const summaryText = (sentences.slice(0, 3).join(" ") || clean.slice(0, 350)).trim();
    const keywords = topKeywords(clean, 3);

    const notes = [
      ...(sentences.slice(0, 2).map((item, idx) => ({
        id: idx + 1,
        title: idx === 0 ? "Key Idea" : "Important Detail",
        text: item,
      })) || []),
      {
        id: 3,
        title: "Highlighted Keywords",
        text: keywords.length ? keywords.join(", ") : "No strong keywords found in this content.",
      },
    ];

    setSummary(summaryText || "No summary could be generated.");
    setStickyPoints(notes);
    setQuiz(generateQuiz(clean));
    setSelectedAnswer("");
    setQuizResult("");
  };

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += ` ${pageText}`;
    }
    return fullText;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setIsProcessing(true);
    try {
      let text = "";
      if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        text = await file.text();
      } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPdf(file);
      } else {
        throw new Error("Please upload only TXT or PDF files.");
      }

      if (!text.trim()) {
        throw new Error("File is empty or text could not be extracted.");
      }

      setContentText(text);
      setUploadedFiles((prev) => [
        { id: Date.now(), name: file.name, uploadedOn: new Date().toISOString().slice(0, 10) },
        ...prev,
      ]);
      generateArtifacts(text);
    } catch (uploadError) {
      setError(uploadError.message || "Could not process file.");
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const submitQuiz = () => {
    if (!quiz || !selectedAnswer) return;
    setQuizResult(
      selectedAnswer === quiz.answer ? "Correct answer. Great work!" : `Not correct. Right answer: ${quiz.answer}`
    );
  };

  const updateFacultyField = (index, field, value) => {
    setFacultyInputs((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const toTimeLabel = (hourValue) => {
    const hour = Math.floor(hourValue);
    const minutes = Math.round((hourValue - hour) * 60);
    const suffix = hour >= 12 ? "PM" : "AM";
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(normalizedHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  const generateTimetable = () => {
    const start = Number(workdayStart);
    const end = Number(workdayEnd);
    const duration = Number(classDuration);

    if (start >= end) {
      setTimetableMessage("Working day end time must be after start time.");
      setGeneratedTimetable([]);
      return;
    }
    if (duration <= 0) {
      setTimetableMessage("Per-class duration must be greater than 0.");
      setGeneratedTimetable([]);
      return;
    }

    const slotsPerDay = Math.floor((end - start) / duration);
    if (slotsPerDay <= 0) {
      setTimetableMessage("No valid class slots in selected working hours.");
      setGeneratedTimetable([]);
      return;
    }

    const slotRows = Array.from({ length: slotsPerDay }, (_, slotIndex) => {
      const slotStart = start + slotIndex * duration;
      const slotEnd = slotStart + duration;
      return {
        slot: `${toTimeLabel(slotStart)} - ${toTimeLabel(slotEnd)}`,
        Monday: "Free",
        Tuesday: "Free",
        Wednesday: "Free",
        Thursday: "Free",
        Friday: "Free",
      };
    });

    const totalCapacity = DAYS.length * slotsPerDay;
    const assignments = [];
    facultyInputs.forEach((faculty) => {
      const parsedHours = Number(faculty.weeklyHours) || 0;
      const requiredClasses = Math.max(0, Math.floor(parsedHours / duration));
      const subjects = faculty.subjects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      for (let i = 0; i < requiredClasses; i += 1) {
        assignments.push({
          facultyName: faculty.name || "Faculty",
          subject: subjects.length ? subjects[i % subjects.length] : "General",
        });
      }
    });

    if (!assignments.length) {
      setTimetableMessage("Please enter weekly hours to generate timetable.");
      setGeneratedTimetable([]);
      return;
    }

    let placedCount = 0;
    const facultySlotUse = new Set();
    let dayPointer = 0;
    let slotPointer = 0;

    assignments.forEach((entry) => {
      let tries = 0;
      let placed = false;
      while (tries < totalCapacity && !placed) {
        const day = DAYS[dayPointer % DAYS.length];
        const slotIdx = slotPointer % slotsPerDay;
        const key = `${entry.facultyName}-${day}-${slotIdx}`;

        if (slotRows[slotIdx][day] === "Free" && !facultySlotUse.has(key)) {
          slotRows[slotIdx][day] = `${entry.subject} (${entry.facultyName})`;
          facultySlotUse.add(key);
          placedCount += 1;
          placed = true;
        }

        dayPointer += 1;
        if (dayPointer % DAYS.length === 0) {
          slotPointer += 1;
        }
        tries += 1;
      }
    });

    const unplaced = assignments.length - placedCount;
    if (unplaced > 0) {
      setTimetableMessage(
        `Timetable generated with limits. ${unplaced} classes could not be scheduled within working hours.`
      );
    } else {
      setTimetableMessage("Timetable generated successfully within working hours.");
    }
    setGeneratedTimetable(slotRows);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Faculty Dashboard</h1>
          <p className="text-gray-600">Welcome, {currentUser?.usn || "Faculty"}.</p>
        </div>
        <button type="button" onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-3">Upload Content</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-600">
            Upload a TXT or PDF file to auto-generate summary, quiz, and sticky notes.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,application/pdf,text/plain"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300"
            disabled={isProcessing}
          >
            Upload
          </button>
          {isProcessing && <div className="mt-3 text-sm text-blue-600">Processing file...</div>}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          <div className="mt-4 text-sm">
            {uploadedFiles.map((item) => (
              <div key={item.id} className="py-1 text-gray-700">
                {item.name} - {item.uploadedOn}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-3">View Student Analytics</h2>
          <p className="text-sm text-gray-600 mb-3">Average performance by subject (dummy data)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceChart}>
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-3">Attendance Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceChart}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Faculty Timetable Generator</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Faculty</label>
              <input
                type="number"
                min="1"
                value={facultyCount}
                onChange={(e) => setFacultyCount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Per-Class Duration (Hours)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={classDuration}
                onChange={(e) => setClassDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Working Day Start (24h)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={workdayStart}
                onChange={(e) => setWorkdayStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Working Day End (24h)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={workdayEnd}
                onChange={(e) => setWorkdayEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {facultyInputs.map((faculty, idx) => (
              <div key={`faculty-row-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={faculty.name}
                  onChange={(e) => updateFacultyField(idx, "name", e.target.value)}
                  placeholder={`Faculty ${idx + 1} Name`}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={faculty.subjects}
                  onChange={(e) => updateFacultyField(idx, "subjects", e.target.value)}
                  placeholder="Subject Preferences (comma-separated)"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={faculty.weeklyHours}
                  onChange={(e) => updateFacultyField(idx, "weeklyHours", e.target.value)}
                  placeholder="Weekly Working Hours"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={generateTimetable}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
          >
            Generate Timetable
          </button>
          {timetableMessage && <p className="mt-3 text-sm font-medium text-gray-700">{timetableMessage}</p>}

          {generatedTimetable.length > 0 && (
            <div className="mt-5 overflow-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left border">Time Slot</th>
                    {DAYS.map((day) => (
                      <th key={day} className="px-3 py-2 text-left border">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generatedTimetable.map((row) => (
                    <tr key={row.slot}>
                      <td className="px-3 py-2 border font-semibold">{row.slot}</td>
                      {DAYS.map((day) => (
                        <td key={`${row.slot}-${day}`} className="px-3 py-2 border">
                          {row[day]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-3">Generated Summary</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {summary || "Upload a TXT/PDF file to generate a summary."}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-3">Sticky Notes (Highlighted Points)</h2>
          <div className="space-y-3">
            {stickyPoints.length ? (
              stickyPoints.map((note) => (
                <div key={note.id} className="bg-yellow-100 border border-yellow-200 rounded-xl p-3">
                  <div className="font-semibold text-gray-900">{note.title}</div>
                  <div className="text-sm text-gray-700">{note.text}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No notes yet. Upload content first.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-3">Quiz From Uploaded Content</h2>
          {quiz ? (
            <div>
              <div className="text-sm text-gray-800 mb-3">{quiz.question}</div>
              <div className="space-y-2">
                {quiz.options.map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="contentQuiz"
                      checked={selectedAnswer === option}
                      onChange={() => setSelectedAnswer(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={submitQuiz}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
              >
                Check Answer
              </button>
              {quizResult && <div className="mt-3 text-sm font-semibold text-gray-800">{quizResult}</div>}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Upload content to generate quiz questions.</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold mb-3">Extracted Content Preview</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-auto">
            {contentText ? `${contentText.slice(0, 1200)}${contentText.length > 1200 ? "..." : ""}` : "No content extracted yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
