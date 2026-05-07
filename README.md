# AI Meeting Application

An AI-powered meeting platform that records meetings, generates live transcripts, translates speech, creates intelligent AI summaries, and exports summaries as PDF documents.

---

## Features

### AI-Powered Audio Processing

* Real-time meeting recording
* Speech-to-text transcription using Whisper API
* AI-generated meeting summaries using GPT API
* Translation support for multilingual meetings
* PDF export for meeting summaries

### Modern Frontend

* Responsive React + Vite UI
* Animated dashboard
* Transcript and summary panels
* Team member section
* Modern navbar and sidebar

### Backend & Database

* Node.js + Express backend
* MongoDB database integration
* Authentication system
* Socket.IO real-time communication

---

# Tech Stack

## Frontend

* React.js
* Vite
* CSS3
* Socket.IO Client

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* Multer

## AI Service

* Flask
* Whisper API
* GPT API
* PDF Generation

---

# Installation Guide

## 1. Clone Repository

```bash
git clone https://github.com/amitdas-4330/AI-MEETING-APPLICATION.git
```

---

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 3. Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 4. AI Service Setup

Create virtual environment:

```bash
cd ai-service
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run Flask server:

```bash
python app.py
```

AI service runs on:

```bash
http://localhost:8000
```

---

# Environment Variables

Create `.env` file in backend:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

---

# Screenshots

## Home Dashboard

![Home Dashboard](frontend/public/screenshots/homeDashboard.png)

## Login Page

![Login](frontend/public/screenshots/login.png)

## Register Page

![Register](frontend/public/screenshots/register.png)

## Running Meeting Tab

![Running Meeting Tab](frontend/public/screenshots/runningMeetingTtab.png)

## Meeting Running

![Meeting Running](frontend/public/screenshots/meetingRunning.png)

## Meeting Share

![Meeting Share](frontend/public/screenshots/meetingShare.png)

## Summary Panel

![Summary](frontend/public/screenshots/summary.png)

## Footer Section

![Footer](frontend/public/screenshots/footer.png)

## About Developer

![About Developer](frontend/public/screenshots/aboutDeveloper.png)

Example:
* login
* Register
* Dashboard UI
* Recorder UI
* Transcript panel
* Summary panel

---

# Future Improvements

* Real-time transcription
* Team collaboration
* Cloud storage integration
* Meeting history dashboard
* AI action items generation
* Multi-language support

---

# Author

## Amit Baran Das

AI & Full Stack Developer

GitHub:
[https://github.com/amitdas-4330](https://github.com/amitdas-4330)

---

# License

This project is developed for educational and portfolio purposes.
