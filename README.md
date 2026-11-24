# AccessAble

> **A world where everyone belongs.**  
> Making digital learning accessible for visually impaired learners through artificial intelligence, voice navigation, and haptic feedback.

---

## Overview

**AccessAble** is an AI-powered assistive learning platform designed to help visually impaired students navigate, read, and interact with digital study materials independently. Built across synchronized web and mobile interfaces, it combines conversational AI, Indian English (`en-IN`) voice navigation, document-to-audio reading, and tactile haptic learning patterns.

---

## Key Features

- **AI Learning Assistant:** Context-aware conversational tutoring and Q&A powered by OpenAI (`gpt-4o-mini`).
- **Voice Navigation (`en-IN`):** Hands-free screen navigation and voice commands tailored for Indian English speech recognition.
- **Text-to-Speech (TTS) Engine:** Real-time audio playback of study notes, interface elements, and AI responses.
- **Document Reader:** Extracts and reads uploaded study documents aloud with playback controls.
- **Haptic Learning:** Tactile vibration feedback patterns on mobile devices to reinforce navigation cues and interactive learning.
- **Accessible High-Contrast UI:** Designed with a calm, high-contrast visual hierarchy for low-vision accessibility alongside screen-reader support.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Frontend** | React.js, Vite, Tailwind CSS, Web Speech API |
| **Mobile App** | Flutter, Dart (`flutter_tts`, `speech_to_text`, `vibration`) |
| **Backend API** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB |
| **AI Integration** | OpenAI API (`gpt-4o-mini`) |

---

## Project Structure

```text
AccessAble/
├── backend/          # Express.js REST API, MongoDB models, Auth & OpenAI routes
├── frontend-web/     # React + Vite web application with Web Speech navigation
├── mobile-app/       # Flutter Android application with TTS & Haptic Learning
├── ai-services/      # AI processing modules and utilities
└── docs/             # Architecture notes and presentation resources
