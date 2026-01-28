
<!-- ===================== -->
<!-- 🚀 PROJECT BANNER -->
<!-- ===================== -->

<p align="center">
  <img src="https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=1600&q=80" alt="Travel Limit Exceeded Banner" width="900"/>
</p>

<h1 align="center">🚫 Travel Limit Exceeded</h1>

<p align="center">
  <strong>AI-Powered Collaborative Travel Planning Platform</strong><br/>
  React ⚛️ + Spring Boot ☕ + PostgreSQL 🐘
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue"/>
  <img src="https://img.shields.io/badge/Backend-SpringBoot-green"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-blue"/>
  <img src="https://img.shields.io/badge/AI-Photo%20%2B%20Prompt-orange"/>
  <img src="https://img.shields.io/badge/Collaboration-Enabled-purple"/>
</p>

---

## 🌍 About the Project

**Travel Limit Exceeded** is a **smart, AI-powered travel collaboration platform** that helps users **discover trips, plan journeys, and travel together**.

Unlike traditional travel apps, this platform supports:

- 📸 **Photo-based travel search**
- 💬 **Prompt-based AI trip generation**
- 🤝 **Collaborative trip planning**

It is designed for **bike rides, group trips, shared journeys, and community-based travel planning**.

---

## ✨ Core Features

<p align="center">
  <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80" width="750"/>
</p>

### 🧠 AI-Powered Features

✅ **Photo → Travel Search**  
Upload a photo (mountains, beaches, highways, cities) and the AI analyzes it to suggest relevant travel destinations and trips.

✅ **Prompt-Based Trip Planning**  
Describe your trip naturally:
> *“Plan a 3-day bike trip to hill stations with less traffic”*  
AI converts it into a structured travel plan.

---

### 🤝 Collaboration Features

✅ **Join Trips & Send Requests**  
Users can request to join trips created by others.

✅ **Seat Management & Status Tracking**  
Live seat availability with approval / rejection workflow.

✅ **Shared Trip Details**  
All members can view routes, schedules, speed limits, and updates.

---

### 🚀 Core Platform Features

✅ User Authentication (Login / Register)  
✅ Trip Creation & Discovery  
✅ Speed, date & destination constraints  
✅ RESTful APIs with Spring Boot  
✅ Secure PostgreSQL storage  

---

## 📸 Photo-to-Search Flow

<p align="center">
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80" width="700"/>
</p>

```

Upload Image
↓
AI Image Analysis
↓
Location / Theme Detection
↓
Matching Trips & Suggestions

```

---

## 💬 Prompt-Based Trip Planning

<p align="center">
  <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80" width="700"/>
</p>

Example prompts:
- “Weekend bike ride under 300km”
- “Beach trip with friends on a low budget”
- “Solo scenic route with less traffic”

AI generates:
- Start & destination
- Travel dates
- Speed & distance limits
- Seat suggestions
- Trip description

---

## 🤝 Collaboration Model

<p align="center">
  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80" width="700"/>
</p>

```

Trip Creator
↓
Join Requests
↓
Approve / Reject
↓
Collaborative Trip Group

```

---

## 🛠️ Tech Stack

### ⚛️ Frontend
- React.js
- Vite
- Tailwind CSS
- Axios

### ☕ Backend
- Spring Boot
- Spring Security
- JPA / Hibernate
- REST APIs

### 🐘 Database
- PostgreSQL
- Supabase / Local PostgreSQL

### 🤖 AI Layer
- Photo Analysis Engine
- Prompt-to-Trip Generator
- Smart Recommendation System

---

## 📂 Backend Structure

```

backend/
├─ controller/        # REST Controllers
├─ service/           # Business logic + AI services
├─ repository/        # JPA repositories
├─ model/             # Entity classes
├─ dto/               # Request / Response DTOs
├─ config/            # Security & configurations
├─ ai/                # Photo & prompt handling
└─ TravelLimitExceededApplication.java

````

---

## 🔐 API Endpoints

| Method | Endpoint | Description |
|------|---------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| GET | `/api/trips` | Fetch all trips |
| POST | `/api/trips` | Create a trip |
| POST | `/api/trips/photo-search` | Photo-based trip search |
| POST | `/api/trips/prompt` | Prompt-based trip planning |
| POST | `/api/trips/{id}/join` | Join a trip |

---

## ⚡ Run Backend Locally

```bash
git clone https://github.com/krishna-Prasad-CEO/travelLimitExceeded.git
cd travelLimitExceeded/backend
./mvnw spring-boot:run
````

Backend runs at:

```
http://localhost:8080
```

---

## 📸 Screenshots

<p align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" width="280"/>
  <img src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=600&q=80" width="280"/>
  <img src="https://images.unsplash.com/photo-1600267165477-6d4cc741b379?auto=format&fit=crop&w=600&q=80" width="280"/>
</p>

---

## 🚀 Future Enhancements

* 🔔 Real-time notifications (WebSockets)
* 🗺️ Live map & GPS tracking
* 👥 Group chat inside trips
* 🧾 Expense splitting
* 📱 Mobile application

---

## 📜 License

MIT License

---

<p align="center">
  ❤️ Built with passion by <strong>Krishna Prasad & Team</strong><br/>
  🚀 Hackathon-ready | Portfolio-worthy
</p>
```

