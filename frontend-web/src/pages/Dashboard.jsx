import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Volume2,
  Hand,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Clock,
  Trophy,
  Target,
  Sparkles,
  Menu,
  Accessibility,
  FileText,
  Headphones,
  ArrowUpRight,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const topbarDropdownRef = useRef(null);

  // CLOSE TOPBAR DROPDOWNS WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        topbarDropdownRef.current &&
        !topbarDropdownRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // RECENTLY ACCESSED MODULES
  const [recentModules, setRecentModules] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("accessable_recent_modules") || "[]"
      );
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  // OPEN A DASHBOARD SECTION REQUESTED BY VOICE NAVIGATION
  useEffect(() => {
    const requestedSection = location.state?.openSection;

    if (requestedSection) {
      setActiveMenu(requestedSection);
      setSelectedGuide(null);
      setSidebarOpen(false);

      // Clear navigation state after opening the requested section.
      navigate("/dashboard", {
        replace: true,
        state: null,
      });
    }
  }, [location.state, navigate]);

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const studentName = savedUser.name || "Student";

  // SIDEBAR MENU
  const menuItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "My Learning", icon: BookOpen },
    { name: "AI Assistant", icon: Brain },
    { name: "Text to Speech", icon: Volume2 },
    { name: "Haptic Learning", icon: Hand },
    { name: "Document Reader", icon: FileText },
    { name: "Resources", icon: FileText },
  ];

  // ACCESSIBILITY TOOLS
  const tools = [
    {
      title: "AI Learning Assistant",
      description: "Get intelligent help with your learning materials.",
      icon: Brain,
      color: "purple",
      label: "Explore AI",
    },
    {
      title: "Text to Speech",
      description: "Convert written content into natural audio.",
      icon: Volume2,
      color: "blue",
      label: "Start listening",
    },
    {
      title: "Haptic Learning",
      description: "Experience interactive learning through touch.",
      icon: Hand,
      color: "orange",
      label: "Explore tool",
    },
    {
      title: "Document Reader",
      description:
        "Upload PDF and text documents and listen to their contents.",
      icon: FileText,
      color: "green",
      label: "Read document",
    },
  ];

  // RECORD MODULE VISIT
  const recordModuleVisit = (moduleName) => {
    const updated = [
      moduleName,
      ...recentModules.filter((item) => item !== moduleName),
    ].slice(0, 4);

    setRecentModules(updated);

    localStorage.setItem(
      "accessable_recent_modules",
      JSON.stringify(updated)
    );
  };

  // NAVIGATION FUNCTIONS
  const openAIAssistant = () => {
    recordModuleVisit("AI Assistant");
    setActiveMenu("AI Assistant");
    setSidebarOpen(false);
    navigate("/ai-assistant");
  };

  const openTextToSpeech = () => {
    recordModuleVisit("Text to Speech");
    setActiveMenu("Text to Speech");
    setSidebarOpen(false);
    navigate("/text-to-speech");
  };

  const openHapticLearning = () => {
    recordModuleVisit("Haptic Learning");
    setActiveMenu("Haptic Learning");
    setSidebarOpen(false);
    navigate("/haptic-learning");
  };

  const openDocumentReader = () => {
    recordModuleVisit("Document Reader");
    setActiveMenu("Document Reader");
    setSidebarOpen(false);
    navigate("/document-reader");
  };

  // SIDEBAR NAVIGATION
  const handleMenuClick = (name) => {
    if (name === "AI Assistant") {
      openAIAssistant();
    } else if (name === "Text to Speech") {
      openTextToSpeech();
    } else if (name === "Haptic Learning") {
      openHapticLearning();
    } else if (name === "Document Reader") {
      openDocumentReader();
    } else {
      setActiveMenu(name);
      setSidebarOpen(false);
      setSelectedGuide(null);
    }
  };

  // TOOL CARD NAVIGATION
  const handleToolClick = (title) => {
    if (title === "AI Learning Assistant") {
      openAIAssistant();
    } else if (title === "Text to Speech") {
      openTextToSpeech();
    } else if (title === "Haptic Learning") {
      openHapticLearning();
    } else if (title === "Document Reader") {
      openDocumentReader();
    }
  };

  // RESOURCE GUIDES
  const resourceGuides = [
    {
      id: "accessibility-basics",
      title: "Accessibility Basics",
      category: "GETTING STARTED",
      description:
        "Understand digital accessibility and simple ways to make learning more inclusive.",
      icon: Accessibility,
      color: "green",
      content: [
        "Digital accessibility means designing websites, documents and learning tools so people with different abilities can use them.",
        "Use clear headings and short paragraphs to make information easier to navigate.",
        "Add meaningful alternative text to informative images.",
        "Make sure buttons and links have clear names and can be used with a keyboard.",
        "Use sufficient colour contrast and never rely on colour alone to communicate important information.",
      ],
    },
    {
      id: "audio-learning",
      title: "Learning with Audio",
      category: "AUDIO SUPPORT",
      description:
        "Learn how to use spoken content to make reading and revision easier.",
      icon: Volume2,
      color: "blue",
      content: [
        "Text-to-speech converts written text into spoken audio.",
        "Paste or enter text into the Text to Speech module and choose a comfortable voice and speaking speed.",
        "Use Play, Pause, Resume and Stop to control playback.",
        "For longer study sessions, listen to a short section at a time and pause to review key points.",
      ],
    },
    {
      id: "haptic-learning",
      title: "Understanding Haptic Feedback",
      category: "INTERACTIVE LEARNING",
      description:
        "Explore how vibration patterns can communicate simple learning signals.",
      icon: Hand,
      color: "orange",
      content: [
        "Haptic feedback uses touch-based signals, such as vibration, to communicate information.",
        "Different patterns can represent different events. For example, a short pulse can indicate a notification and repeated pulses can represent an alert.",
        "Try the patterns in AccessAble's Haptic Learning module.",
        "Vibration requires a supported device and browser. If your laptop does not vibrate, the module may still demonstrate patterns through audio and on-screen feedback.",
      ],
    },
    {
      id: "document-access",
      title: "Accessible Documents",
      category: "READING SUPPORT",
      description:
        "Simple tips for preparing and reading digital documents.",
      icon: FileText,
      color: "purple",
      content: [
        "Use selectable text in PDFs whenever possible. Scanned image-only documents may not contain text that a reader can extract.",
        "Organise documents with descriptive headings and a logical reading order.",
        "Use meaningful link text instead of phrases such as 'click here'.",
        "Use the AccessAble Document Reader to upload supported PDF or TXT files and listen to extracted text.",
      ],
    },
  ];

  // MY LEARNING MODULE DATA
  const learningModules = [
    {
      title: "AI Learning Assistant",
      name: "AI Assistant",
      description:
        "Get intelligent answers and personalized learning support.",
      icon: Brain,
      color: "purple",
      action: openAIAssistant,
    },
    {
      title: "Text to Speech",
      name: "Text to Speech",
      description:
        "Listen to written content using natural speech.",
      icon: Volume2,
      color: "blue",
      action: openTextToSpeech,
    },
    {
      title: "Haptic Learning",
      name: "Haptic Learning",
      description:
        "Explore interactive learning through touch and vibration.",
      icon: Hand,
      color: "orange",
      action: openHapticLearning,
    },
    {
      title: "Document Reader",
      name: "Document Reader",
      description:
        "Upload PDF and text documents and listen to their contents.",
      icon: FileText,
      color: "green",
      action: openDocumentReader,
    },
  ];

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="sidebar-logo">
          <div className="logo-icon">
            <Accessibility size={25} />
          </div>
          <span>access<span>able</span></span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`sidebar-link ${
                  activeMenu === item.name ? "active" : ""
                }`}
                onClick={() => handleMenuClick(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-help">
            <Sparkles size={21} />
            <h4>Need assistance?</h4>

            <p>
              Discover tools designed to make learning easier.
            </p>

            <button onClick={openAIAssistant}>
              Get support <ChevronRight size={15} />
            </button>
          </div>

          <button
            className="sidebar-link"
            onClick={() => setActiveMenu("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            className="sidebar-link logout-link"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            <LogOut size={19} />
            <span>Log out</span>
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* TOPBAR */}
        <header className="dashboard-topbar">

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={23} />
          </button>

          <div className="topbar-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search learning tools and resources..."
              aria-label="Search learning tools and resources"
            />
          </div>

          <div className="topbar-actions" ref={topbarDropdownRef}>

            {/* NOTIFICATIONS */}
            <div className="topbar-dropdown-wrapper">
              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen((open) => !open);
                  setProfileOpen(false);
                }}
              >
                <Bell size={20} />
                <span className="notification-indicator" />
              </button>

              {notificationOpen && (
                <div
                  className="dashboard-dropdown notification-dropdown"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="dropdown-heading">
                    <h3>Notifications</h3>
                    <span>0 New</span>
                  </div>

                  <div className="notification-empty">
                    <div className="notification-empty-icon">
                      <Bell size={25} />
                    </div>
                    <h4>You're all caught up!</h4>
                    <p>
                      You don't have any notifications right now.
                      New updates will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE */}
            <div className="topbar-dropdown-wrapper">
              <button
                type="button"
                className="topbar-profile"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotificationOpen(false);
                }}
              >
                <div className="profile-avatar">
                  {studentName.charAt(0).toUpperCase()}
                </div>

                <div className="profile-user-details">
                  <h4>{studentName}</h4>
                  <p>{savedUser.role || "Student"}</p>
                </div>
              </button>

              {profileOpen && (
                <div
                  className="dashboard-dropdown profile-dropdown"
                  role="menu"
                  aria-label="Profile options"
                >
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar">
                      {studentName.charAt(0).toUpperCase()}
                    </div>

                    <div className="profile-dropdown-user">
                      <h4>{studentName}</h4>
                      <p>{savedUser.email || "AccessAble User"}</p>
                      <span>{savedUser.role || "Student"}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      setActiveMenu("Settings");
                      setSelectedGuide(null);
                    }}
                  >
                    <Settings size={17} />
                    Account Settings
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item profile-logout"
                    role="menuitem"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      sessionStorage.removeItem("token");
                      sessionStorage.removeItem("user");
                      window.location.href = "/login";
                    }}
                  >
                    <LogOut size={17} />
                    Log out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="dashboard-content">

          {/* MY LEARNING PAGE */}
          {activeMenu === "My Learning" ? (

            <section className="my-learning-page">

              <div className="my-learning-heading">
                <p className="section-eyebrow">
                  YOUR LEARNING SPACE
                </p>

                <h1>My Learning</h1>

                <p>
                  Explore your accessibility tools and continue
                  your learning journey.
                </p>
              </div>

              {/* LEARNING OVERVIEW */}
              <div className="learning-overview-card">

                <div>
                  <p className="section-eyebrow">
                    YOUR PROGRESS
                  </p>

                  <h2>Welcome to your learning space!</h2>

                  <p>
                    Explore the available modules and discover
                    tools designed to make learning accessible.
                  </p>
                </div>

                <div className="learning-overview-number">
                  <strong>{recentModules.length}/4</strong>
                  <span>Modules explored</span>
                </div>

              </div>

              {/* LEARNING MODULES */}
              <div className="my-learning-section-heading">
                <div>
                  <h2>Available Learning Modules</h2>
                  <p>
                    Choose a module to start or continue learning.
                  </p>
                </div>
              </div>

              <div className="tools-grid">

                {learningModules.map((module) => {
                  const Icon = module.icon;
                  const isOpened = recentModules.includes(module.name);

                  return (
                    <article
                      className="tool-card my-learning-module"
                      key={module.name}
                    >
                      <div className={`tool-icon ${module.color}`}>
                        <Icon size={26} />
                      </div>

                      <h3>{module.title}</h3>
                      <p>{module.description}</p>

                      <div className="learning-module-status">
                        <span
                          className={
                            isOpened ? "module-opened" : "module-new"
                          }
                        >
                          {isOpened
                            ? "Previously opened"
                            : "Not started"}
                        </span>
                      </div>

                      <button
                        className="tool-button"
                        onClick={module.action}
                      >
                        {isOpened
                          ? "Continue learning"
                          : "Start learning"}

                        <ArrowUpRight size={17} />
                      </button>
                    </article>
                  );
                })}

              </div>

              {/* RECENTLY ACCESSED */}
              <div className="recent-learning-section">

                <div className="recent-learning-heading">
                  <div>
                    <p className="section-eyebrow">
                      YOUR ACTIVITY
                    </p>
                    <h2>Recently Accessed</h2>
                  </div>

                  <Clock size={22} />
                </div>

                {recentModules.length > 0 ? (

                  <div className="recent-learning-list">

                    {recentModules.map((moduleName) => {
                      const module = learningModules.find(
                        (item) => item.name === moduleName
                      );

                      const Icon = module?.icon || BookOpen;

                      return (
                        <div
                          className="recent-learning-item"
                          key={moduleName}
                        >
                          <div className="recent-learning-icon">
                            <Icon size={20} />
                          </div>

                          <div className="recent-learning-details">
                            <h3>{moduleName}</h3>
                            <p>Recently opened learning module</p>
                          </div>

                          <span className="module-opened">
                            Opened
                          </span>

                          <button
                            aria-label={`Continue ${moduleName}`}
                            onClick={() => module?.action()}
                          >
                            <ChevronRight size={19} />
                          </button>
                        </div>
                      );
                    })}

                  </div>

                ) : (

                  <div className="recent-learning-empty">
                    <div className="recent-learning-empty-icon">
                      <BookOpen size={30} />
                    </div>

                    <h3>No learning activity yet</h3>

                    <p>
                      Open one of the learning modules above.
                      Your recently accessed modules will appear here.
                    </p>
                  </div>

                )}

              </div>
            </section>

          ) : activeMenu === "Resources" ? (

            /* RESOURCES PAGE */
            <section className="my-learning-page resources-page">

              <div className="my-learning-heading">
                <p className="section-eyebrow">
                  ACCESSIBLE KNOWLEDGE HUB
                </p>

                <h1>Resources</h1>

                <p>
                  Explore practical guides and trusted accessibility
                  references to help make your learning experience
                  more inclusive.
                </p>
              </div>

              {/* LEARNING GUIDES */}
              <div className="my-learning-section-heading">
                <div>
                  <h2>Learning Guides</h2>
                  <p>
                    Choose a guide to read helpful tips and instructions.
                  </p>
                </div>
              </div>

              <div className="tools-grid">

                {resourceGuides.map((guide) => {
                  const Icon = guide.icon;

                  return (
                    <article
                      className="tool-card my-learning-module"
                      key={guide.id}
                    >
                      <div className={`tool-icon ${guide.color}`}>
                        <Icon size={26} />
                      </div>

                      <p className="section-eyebrow">
                        {guide.category}
                      </p>

                      <h3>{guide.title}</h3>
                      <p>{guide.description}</p>

                      <button
                        className="tool-button"
                        onClick={() => setSelectedGuide(guide)}
                      >
                        Read Guide
                        <ArrowUpRight size={17} />
                      </button>
                    </article>
                  );
                })}

              </div>

              {/* TRUSTED REFERENCES */}
              <section className="recent-learning-section">

                <div className="recent-learning-heading">
                  <div>
                    <p className="section-eyebrow">
                      TRUSTED REFERENCES
                    </p>

                    <h2>Explore more accessibility resources</h2>
                  </div>

                  <BookOpen size={22} />
                </div>

                <div className="tools-grid">

                  <article className="tool-card">
                    <div className="tool-icon green">
                      <Accessibility size={26} />
                    </div>

                    <h3>W3C Web Accessibility Initiative</h3>

                    <p>
                      Guidance and standards for making web content
                      accessible to people with disabilities.
                    </p>

                    <a
                      className="tool-button"
                      href="https://www.w3.org/WAI/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit W3C WAI
                      <ArrowUpRight size={17} />
                    </a>
                  </article>

                  <article className="tool-card">
                    <div className="tool-icon blue">
                      <BookOpen size={26} />
                    </div>

                    <h3>WebAIM</h3>

                    <p>
                      Practical articles, evaluation tools and learning
                      materials about web accessibility.
                    </p>

                    <a
                      className="tool-button"
                      href="https://webaim.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit WebAIM
                      <ArrowUpRight size={17} />
                    </a>
                  </article>

                </div>
              </section>

              {/* QUICK ACCESS */}
              <section className="recent-learning-section">

                <div className="recent-learning-heading">
                  <div>
                    <p className="section-eyebrow">
                      QUICK ACCESS
                    </p>

                    <h2>Open an AccessAble tool</h2>
                  </div>

                  <Sparkles size={22} />
                </div>

                <div className="tools-grid">

                  <button
                    className="tool-card resource-quick-link"
                    onClick={openAIAssistant}
                  >
                    <div className="tool-icon purple">
                      <Brain size={26} />
                    </div>

                    <h3>AI Assistant</h3>

                    <p>
                      Ask questions and get learning support.
                    </p>

                    <span className="tool-button">
                      Open tool
                      <ArrowUpRight size={17} />
                    </span>
                  </button>

                  <button
                    className="tool-card resource-quick-link"
                    onClick={openTextToSpeech}
                  >
                    <div className="tool-icon blue">
                      <Volume2 size={26} />
                    </div>

                    <h3>Text to Speech</h3>

                    <p>
                      Listen to written content.
                    </p>

                    <span className="tool-button">
                      Open tool
                      <ArrowUpRight size={17} />
                    </span>
                  </button>

                  <button
                    className="tool-card resource-quick-link"
                    onClick={openDocumentReader}
                  >
                    <div className="tool-icon green">
                      <FileText size={26} />
                    </div>

                    <h3>Document Reader</h3>

                    <p>
                      Read supported PDF and TXT documents.
                    </p>

                    <span className="tool-button">
                      Open tool
                      <ArrowUpRight size={17} />
                    </span>
                  </button>

                </div>
              </section>

            </section>

          ) : activeMenu === "Settings" ? (

            /* SETTINGS PAGE */
            <section className="dashboard-settings-page">
              <div className="settings-page-heading">
                <p className="section-eyebrow">PREFERENCES</p>
                <h1>Account Settings</h1>
                <p>View your AccessAble account information and manage account access.</p>
              </div>

              <div className="settings-card-grid">
                <article className="settings-card settings-profile-card">
                  <div className="settings-card-heading">
                    <div className="settings-card-icon">
                      <Accessibility size={21} />
                    </div>
                    <div>
                      <h2>Profile information</h2>
                      <p>Your account details</p>
                    </div>
                  </div>

                  <div className="settings-profile-avatar">
                    {studentName.charAt(0).toUpperCase()}
                  </div>

                  <div className="settings-detail-row">
                    <span>Full name</span>
                    <strong>{savedUser.name || "Not available"}</strong>
                  </div>
                  <div className="settings-detail-row">
                    <span>Email address</span>
                    <strong>{savedUser.email || "Not available"}</strong>
                  </div>
                  <div className="settings-detail-row">
                    <span>Account role</span>
                    <strong className="settings-role">
                      {savedUser.role || "Student"}
                    </strong>
                  </div>
                  {savedUser.department && (
                    <div className="settings-detail-row">
                      <span>Department</span>
                      <strong>{savedUser.department}</strong>
                    </div>
                  )}
                </article>

                <article className="settings-card">
                  <div className="settings-card-heading">
                    <div className="settings-card-icon">
                      <Settings size={21} />
                    </div>
                    <div>
                      <h2>Accessibility tools</h2>
                      <p>Open a tool to manage its available options</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="settings-action-row"
                    onClick={() => setActiveMenu("AI Assistant")}
                  >
                    <Brain size={19} />
                    <span>
                      <strong>AI Assistant</strong>
                      <small>Open your AI learning assistant</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="settings-action-row"
                    onClick={() => setActiveMenu("Text to Speech")}
                  >
                    <Volume2 size={19} />
                    <span>
                      <strong>Text to Speech</strong>
                      <small>Open speech and reading tools</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="settings-action-row"
                    onClick={() => setActiveMenu("Haptic Learning")}
                  >
                    <Hand size={19} />
                    <span>
                      <strong>Haptic Learning</strong>
                      <small>Open tactile learning tools</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="settings-action-row"
                    onClick={() => setActiveMenu("Document Reader")}
                  >
                    <FileText size={19} />
                    <span>
                      <strong>Document Reader</strong>
                      <small>Open accessible document reading</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </article>

                <article className="settings-card settings-security-card">
                  <div className="settings-card-heading">
                    <div className="settings-card-icon">
                      <Settings size={21} />
                    </div>
                    <div>
                      <h2>Account security</h2>
                      <p>Keep your account secure</p>
                    </div>
                  </div>

                  <p className="settings-security-description">
                    You can request a password reset link using your registered email address.
                  </p>

                  <button
                    type="button"
                    className="settings-primary-button"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Reset password
                    <ChevronRight size={17} />
                  </button>
                </article>
              </div>
            </section>

          ) : (

            <>
              {/* WELCOME */}
              <section className="welcome-section">

                <div>
                  <p className="welcome-date">
                    <Sparkles size={15} />
                    YOUR ACCESSIBLE LEARNING SPACE
                  </p>

                  <h1>
                    Welcome back,{" "}
                    <span>{studentName.split(" ")[0]}!</span>
                  </h1>

                  <p className="welcome-description">
                    Your learning journey continues here. Explore, learn and
                    experience education without barriers.
                  </p>
                </div>

                <div className="welcome-illustration">
                  <div className="illustration-circle">
                    <Accessibility size={85} strokeWidth={1.3} />
                  </div>

                  <div className="illustration-badge">
                    <Sparkles size={17} />
                    Learning without limits
                  </div>
                </div>

              </section>

              {/* STATISTICS */}
              <section className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon stat-purple">
                    <BookOpen size={22} />
                  </div>

                  <p>Learning modules</p>
                  <h2>06</h2>
                  <span>Available to explore</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-green">
                    <Clock size={22} />
                  </div>

                  <p>Learning time</p>
                  <h2>00 hrs</h2>
                  <span>Your learning activity</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-orange">
                    <Trophy size={22} />
                  </div>

                  <p>Achievements</p>
                  <h2>00</h2>
                  <span>Keep learning to earn more</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stat-blue">
                    <Target size={22} />
                  </div>

                  <p>Learning goals</p>
                  <h2>03</h2>
                  <span>Suggested goals</span>
                </div>

              </section>

              {/* ACCESSIBILITY TOOLS */}
              <section className="tools-section">

                <div className="section-heading">
                  <div>
                    <p className="section-eyebrow">DISCOVER</p>

                    <h2>Explore accessibility tools</h2>

                    <p>
                      Technology designed around your unique learning needs.
                    </p>
                  </div>

                  <button
                    className="view-all-button"
                    onClick={() => setActiveMenu("My Learning")}
                  >
                    View all
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="tools-grid">

                  {tools.map((tool) => {
                    const Icon = tool.icon;

                    return (
                      <article
                        className="tool-card"
                        key={tool.title}
                      >
                        <div className={`tool-icon ${tool.color}`}>
                          <Icon size={26} />
                        </div>

                        <h3>{tool.title}</h3>
                        <p>{tool.description}</p>

                        <button
                          onClick={() => handleToolClick(tool.title)}
                          className="tool-button"
                        >
                          {tool.label}
                          <ArrowUpRight size={17} />
                        </button>
                      </article>
                    );
                  })}

                </div>
              </section>

              {/* BOTTOM SECTION */}
              <section className="bottom-grid">

                <div className="learning-card">

                  <div className="section-heading">
                    <div>
                      <p className="section-eyebrow">YOUR JOURNEY</p>
                      <h2>Continue learning</h2>
                    </div>

                    <BookOpen size={23} />
                  </div>

                  <div className="learning-empty">
                    <div className="empty-icon">
                      <BookOpen size={31} />
                    </div>

                    <h3>Your learning journey starts here.</h3>

                    <p>
                      Explore accessible learning materials and start
                      building your skills.
                    </p>

                    <button
                      onClick={() => setActiveMenu("My Learning")}
                    >
                      Explore learning
                      <ChevronRight size={17} />
                    </button>
                  </div>

                </div>

                <div className="quick-card">
                  <p className="section-eyebrow">QUICK ACCESS</p>

                  <h2>Made for everyone.</h2>

                  <p>
                    Access your learning environment with tools that
                    support different abilities.
                  </p>

                  <button
                    className="quick-item"
                    onClick={openTextToSpeech}
                  >
                    <Volume2 size={20} />
                    <span>Audio assistance</span>
                    <ChevronRight size={17} />
                  </button>

                  <button
                    className="quick-item"
                    onClick={openDocumentReader}
                  >
                    <FileText size={20} />
                    <span>Document Reader</span>
                    <ChevronRight size={17} />
                  </button>

                  <button
                    className="quick-item"
                    onClick={openHapticLearning}
                  >
                    <Headphones size={20} />
                    <span>Learning support</span>
                    <ChevronRight size={17} />
                  </button>
                </div>

              </section>

              {/* FOOTER */}
              <footer className="dashboard-footer">
                <p>
                  © 2026 AccessAble. Designed around people. Built for everyone.
                </p>

                <span>
                  <Accessibility size={16} />
                  Accessibility first
                </span>
              </footer>

            </>

          )}

        </div>

      </main>

      {/* READ GUIDE POPUP */}
      {selectedGuide && (
        <div
          onClick={() => setSelectedGuide(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 30, 22, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-guide-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: "22px",
              padding: "35px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <p className="section-eyebrow">
              {selectedGuide.category}
            </p>

            <h2
              id="resource-guide-title"
              style={{
                color: "#244b37",
                fontSize: "26px",
                margin: "12px 0 20px",
              }}
            >
              {selectedGuide.title}
            </h2>

            <p
              style={{
                color: "#64756b",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              {selectedGuide.description}
            </p>

            <ol
              style={{
                paddingLeft: "22px",
                lineHeight: 1.9,
                color: "#52645a",
              }}
            >
              {selectedGuide.content.map((point, index) => (
                <li
                  key={index}
                  style={{ marginBottom: "14px" }}
                >
                  {point}
                </li>
              ))}
            </ol>

            <button
              className="tool-button"
              onClick={() => setSelectedGuide(null)}
              style={{ marginTop: "20px" }}
            >
              Close Guide
              <ChevronRight size={17} />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;