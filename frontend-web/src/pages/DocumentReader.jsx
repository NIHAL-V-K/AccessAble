import { useEffect, useRef, useState } from "react";
import BackToDashboard from "../components/BackToDashboard";

import {
  Accessibility,
  FileText,
  Upload,
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Trash2,
  Headphones,
  Gauge,
  Languages,
  Sparkles,
  FileCheck,
  AlertCircle,
  BookOpen,
  Download,
  BookMarked,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import "./DocumentReader.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function DocumentReader() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [documentPages, setDocumentPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readingMode, setReadingMode] = useState("document");

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const activeWordRef = useRef(null);
  const utteranceRef = useRef(null);

  // LOAD BROWSER VOICES
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      setVoices(availableVoices);

      if (availableVoices.length && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // AUTOMATICALLY SCROLL TO SPOKEN WORD
  useEffect(() => {
    if (isSpeaking && !isPaused && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentCharIndex, isSpeaking, isPaused]);

  // STOP SPEECH
  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentCharIndex(-1);
    utteranceRef.current = null;
  };

  // EXTRACT PDF TEXT
  const extractPDFText = async (selectedFile) => {
    const buffer = await selectedFile.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      pages.push(pageText);
    }

    return {
      pages,
      text: pages
        .map((pageText, index) => `Page ${index + 1}\n${pageText}`)
        .join("\n\n")
        .trim(),
    };
  };

  // UPLOAD DOCUMENT
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    handleStop();

    setError("");
    setLoading(true);
    setFile(null);
    setExtractedText("");
    setDocumentPages([]);
    setCurrentPage(0);

    try {
      const extension = selectedFile.name
        .split(".")
        .pop()
        .toLowerCase();

      let content = "";
      let pages = [];

      if (extension === "txt") {
        content = await selectedFile.text();
        pages = [content];
      } else if (extension === "pdf") {
        const result = await extractPDFText(selectedFile);
        content = result.text;
        pages = result.pages;
      } else {
        throw new Error("Please upload only PDF or TXT files.");
      }

      if (!content.trim()) {
        throw new Error(
          "No readable text was found. This PDF may contain scanned images."
        );
      }

      setFile(selectedFile);
      setExtractedText(content);
      setDocumentPages(pages);
      setCurrentCharIndex(-1);
    } catch (err) {
      setError(err.message || "Unable to read this document.");
    } finally {
      setLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // CALCULATE PAGE START POSITION IN FULL DOCUMENT
  const getPageStartIndex = (pageIndex) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      return 0;
    }

    let offset = 0;

    for (let i = 0; i < pageIndex; i++) {
      offset += `Page ${i + 1}\n${documentPages[i]}`.length + 2;
    }

    return offset + `Page ${pageIndex + 1}\n`.length;
  };

  // START SPEECH
  const startReading = (text, startIndex, mode) => {
    if (!text.trim()) return;

    if (!("speechSynthesis" in window)) {
      setError("Text-to-Speech is not supported in this browser.");
      return;
    }

    handleStop();

    setError("");
    setReadingMode(mode);
    setCurrentCharIndex(startIndex);

    const utterance = new SpeechSynthesisUtterance(text);

    const voice = voices.find(
      (item) => item.name === selectedVoice
    );

    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number") {
        setCurrentCharIndex(startIndex + event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentCharIndex(startIndex + text.length);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      if (
        event.error !== "canceled" &&
        event.error !== "interrupted"
      ) {
        setError("Speech playback could not be completed.");
      }

      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // READ COMPLETE DOCUMENT
  const handlePlay = () => {
    startReading(extractedText, 0, "document");
  };

  // READ ONLY SELECTED PAGE
  const handleReadPage = () => {
    const pageText = documentPages[currentPage];

    if (!pageText) return;

    const pageStart = getPageStartIndex(currentPage);

    startReading(pageText, pageStart, "page");
  };

  // PAUSE / RESUME
  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // DOWNLOAD EXTRACTED TEXT
  const handleDownload = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const originalName = file?.name
      ? file.name.replace(/\.[^/.]+$/, "")
      : "document";

    link.href = url;
    link.download = `${originalName}_extracted.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // CLEAR DOCUMENT
  const handleClear = () => {
    handleStop();

    setFile(null);
    setExtractedText("");
    setDocumentPages([]);
    setCurrentPage(0);
    setCurrentCharIndex(-1);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // RESET SETTINGS
  const handleReset = () => {
    handleStop();

    setRate(1);
    setPitch(1);

    if (voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  };

  // PAGE NAVIGATION
  const goToPage = (pageIndex) => {
    handleStop();

    setCurrentPage(
      Math.max(0, Math.min(documentPages.length - 1, pageIndex))
    );
  };

  // DOCUMENT STATISTICS
  const wordCount = extractedText.trim()
    ? extractedText.trim().split(/\s+/).length
    : 0;

  const characterCount = extractedText.length;

  const readingProgress =
    extractedText.length > 0 && currentCharIndex >= 0
      ? Math.min(
          100,
          Math.round(
            (currentCharIndex / extractedText.length) * 100
          )
        )
      : 0;

  const visiblePageText = documentPages[currentPage] || "";
  const pageStartIndex = getPageStartIndex(currentPage);

  // RENDER WORD HIGHLIGHTING
  const renderHighlightedText = () => {
    if (currentCharIndex < 0 || !isSpeaking) {
      return visiblePageText;
    }

    const tokens = visiblePageText.match(/\s+|\S+/g) || [];

    let position = 0;

    return tokens.map((token, index) => {
      const tokenStart = position;
      const tokenEnd = position + token.length;

      position = tokenEnd;

      const absoluteStart = pageStartIndex + tokenStart;
      const absoluteEnd = pageStartIndex + tokenEnd;

      const highlighted =
        /\S/.test(token) &&
        currentCharIndex >= absoluteStart &&
        currentCharIndex < absoluteEnd;

      return highlighted ? (
        <mark
          className="dr-speaking-word"
          key={index}
          ref={activeWordRef}
        >
          {token}
        </mark>
      ) : (
        <span key={index}>{token}</span>
      );
    });
  };

  return (
    <div className="dr-page">

      {/* SIDEBAR */}
      <aside className="dr-sidebar">

        <div className="dr-brand">
          <div className="dr-brand-icon">
            <Accessibility size={25} />
          </div>

          <span>
            access<span>able</span>
          </span>
        </div>

        <p className="dr-sidebar-label">
          ACCESSIBILITY TOOLS
        </p>

        <div className="dr-sidebar-item">
          <FileText size={19} />
          Document Reader
        </div>

        <div className="dr-sidebar-bottom">
          <Sparkles size={22} />
          <h4>Read without limits.</h4>
          <p>
            Turn your documents into accessible listening experiences.
          </p>
        </div>

        <div className="dr-sidebar-footer">
          ACCESSABLE AI
          <span>Learning made inclusive.</span>
        </div>

      </aside>

      {/* MAIN */}
      <main className="dr-main">

        <header className="dr-header">
          <BackToDashboard />
          <div>
            <h2>Document Reader</h2>
            <p>
              Upload documents and listen to their contents.
            </p>
          </div>

          <div className="dr-header-badge">
            <span></span>
            Accessible reading
          </div>
        </header>

        <section className="dr-content">

          {/* INTRO */}
          <div className="dr-intro">
            <div className="dr-intro-icon">
              <Headphones size={27} />
            </div>

            <span>DOCUMENT ACCESSIBILITY</span>

            <h1>
              Your documents,
              <br />
              <span>now speak to you.</span>
            </h1>

            <p>
              Upload a PDF or text document, extract its contents
              and listen to it in a voice and speed that suit you.
            </p>
          </div>

          {/* UPLOAD */}
          <div className="dr-card">

            <div className="dr-card-header">
              <div>
                <h3>
                  <Upload size={19} />
                  Upload your document
                </h3>
                <p>Supported formats: PDF and TXT</p>
              </div>

              <FileCheck size={24} />
            </div>

            <div
              className="dr-upload-area"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();

                const droppedFile = event.dataTransfer.files?.[0];

                if (droppedFile && fileInputRef.current) {
                  const transfer = new DataTransfer();
                  transfer.items.add(droppedFile);

                  fileInputRef.current.files = transfer.files;

                  handleFileUpload({
                    target: fileInputRef.current,
                  });
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="dr-upload-icon">
                <Upload size={29} />
              </div>

              <h3>Drop your document here</h3>
              <p>or click below to browse files</p>

              <button
                type="button"
                className="dr-upload-button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload size={17} />
                Choose Document
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileUpload}
                hidden
              />

              <span className="dr-supported">
                PDF or TXT files only
              </span>
            </div>

            {loading && (
              <div className="dr-loading">
                <span className="dr-spinner"></span>
                Extracting document text...
              </div>
            )}

            {error && (
              <div className="dr-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {file && !loading && (
              <div className="dr-file-info">
                <div className="dr-file-icon">
                  <FileText size={23} />
                </div>

                <div>
                  <h4>{file.name}</h4>
                  <p>
                    {(file.size / 1024).toFixed(1)} KB ·{" "}
                    {file.name.split(".").pop().toUpperCase()}
                  </p>
                </div>

                <FileCheck
                  size={21}
                  className="dr-file-check"
                />
              </div>
            )}

          </div>

          {/* DOCUMENT PREVIEW */}
          {extractedText && (
            <div className="dr-card dr-preview-card">

              <div className="dr-card-header">
                <div>
                  <h3>
                    <BookOpen size={19} />
                    Extracted document content
                  </h3>
                  <p>Review the text before listening.</p>
                </div>

                <button
                  className="dr-clear-button"
                  onClick={handleClear}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>

              {/* STATISTICS */}
              <div className="dr-stats">
                <div>
                  <strong>
                    {wordCount.toLocaleString("en-IN")}
                  </strong>
                  <span>Words</span>
                </div>

                <div>
                  <strong>
                    {characterCount.toLocaleString("en-IN")}
                  </strong>
                  <span>Characters</span>
                </div>

                <div>
                  <strong>
                    {file?.name.toLowerCase().endsWith(".pdf")
                      ? "PDF"
                      : "TXT"}
                  </strong>
                  <span>Format</span>
                </div>
              </div>

              {/* PAGE NAVIGATION */}
              <div className="dr-page-navigation">

                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous page
                </button>

                <span>
                  {file?.name.toLowerCase().endsWith(".pdf")
                    ? `Page ${currentPage + 1} of ${documentPages.length}`
                    : "Text document"}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={
                    currentPage >= documentPages.length - 1
                  }
                >
                  Next page
                </button>

              </div>

              {/* TEXT PREVIEW */}
              <div
                ref={previewRef}
                className="dr-preview-text dr-highlight-preview"
              >
                {renderHighlightedText()}
              </div>

              {/* PROGRESS */}
              <div className="dr-progress-section">

                <div className="dr-progress-heading">
                  <span>Reading progress</span>
                  <strong>{readingProgress}%</strong>
                </div>

                <div
                  className="dr-progress-track"
                  role="progressbar"
                  aria-valuenow={readingProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="dr-progress-fill"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>

                <p>
                  {currentCharIndex < 0
                    ? "Start reading to track your progress."
                    : currentCharIndex >= extractedText.length
                      ? "Document reading completed."
                      : "The highlighted word follows the speech."}
                </p>

              </div>

              {/* VOICE SETTINGS */}
              <div className="dr-settings">

                <div className="dr-setting">
                  <label>
                    <Languages size={17} />
                    Voice
                  </label>

                  <select
                    value={selectedVoice}
                    onChange={(event) =>
                      setSelectedVoice(event.target.value)
                    }
                    disabled={!voices.length}
                  >
                    {voices.length === 0 && (
                      <option value="">
                        Loading voices...
                      </option>
                    )}

                    {voices.map((voice) => (
                      <option
                        key={voice.name}
                        value={voice.name}
                      >
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dr-setting">
                  <label>
                    <Gauge size={17} />
                    Speech Speed
                    <strong>{rate.toFixed(1)}x</strong>
                  </label>

                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(event) =>
                      setRate(Number(event.target.value))
                    }
                  />

                  <div className="dr-range-labels">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div className="dr-setting">
                  <label>
                    <Volume2 size={17} />
                    Voice Pitch
                    <strong>{pitch.toFixed(1)}</strong>
                  </label>

                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(event) =>
                      setPitch(Number(event.target.value))
                    }
                  />

                  <div className="dr-range-labels">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

              </div>

              {/* PLAYBACK CONTROLS */}
              <div className="dr-controls">

                {!isSpeaking ? (
                  <button
                    className="dr-play-button"
                    onClick={handlePlay}
                  >
                    <Play size={18} fill="currentColor" />
                    Read Document
                  </button>
                ) : (
                  <button
                    className="dr-play-button"
                    onClick={handlePauseResume}
                  >
                    {isPaused ? (
                      <>
                        <Play size={18} fill="currentColor" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause size={18} />
                        Pause
                      </>
                    )}
                  </button>
                )}

                <button
                  className="dr-page-read-button"
                  onClick={handleReadPage}
                  disabled={isSpeaking || !visiblePageText.trim()}
                >
                  <BookMarked size={17} />
                  Read This Page
                </button>

                <button
                  className="dr-stop-button"
                  onClick={handleStop}
                  disabled={!isSpeaking}
                >
                  <Square size={16} />
                  Stop
                </button>

                <button
                  className="dr-reset-button"
                  onClick={handleReset}
                >
                  <RotateCcw size={16} />
                  Reset settings
                </button>

              </div>

              {/* DOWNLOAD */}
              <div className="dr-download-section">

                <div>
                  <h4>Save extracted content</h4>
                  <p>
                    Download the extracted document as a text file.
                  </p>
                </div>

                <button
                  className="dr-download-button"
                  onClick={handleDownload}
                >
                  <Download size={17} />
                  Download TXT
                </button>

              </div>

            </div>
          )}

          {/* INFORMATION */}
          <div className="dr-info">

            <div className="dr-info-icon">
              <Volume2 size={21} />
            </div>

            <div>
              <h4>Reading made accessible</h4>
              <p>
                Upload your document, review the extracted text
                and listen at your own pace. Scanned PDFs containing
                only images require OCR and are not supported yet.
                Available voices depend on your browser and operating system.
              </p>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DocumentReader;