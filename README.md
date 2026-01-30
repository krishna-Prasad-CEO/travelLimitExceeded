# ✈️ Travel Limit Exceeded (TLE)

## Overview

You can access it here : https://traveltofutureland.netlify.app/

Note : If something not working properly... Kindly Read Getting Started Section

Travel Limit Exceeded (TLE) is a travel planning application focused on **how people actually plan trips** — by sharing ideas, photos, and conversations with others.

Instead of switching between chat apps, notes, and travel websites, TLE brings everything into one place where users can **plan trips together** and turn inspiration into a real itinerary.

---

## Project Structure

This repository is split into two main branches:

| Branch | Purpose |
|------|--------|
| `development` | Frontend code (React + Vite) |
| `backend` | Backend logic (Java + Spring Boot) |

Frontend and backend are kept separate to keep the architecture clean and easy to manage.

---

## Features

### 1. Photo to Trip

Users can upload a travel-related photo and use it as the starting point for planning a trip.

The system:
- Looks at the overall vibe of the image
- Generates a basic itinerary based on that inspiration
- Allows users to edit and adjust the plan as needed

This helps users move from inspiration to planning without starting from a blank page.

---

### 2. Chat-Based Trip Planning

Users can also create trips by simply describing what they want in plain language.

Example:
> “I want a 4-day mountain trip within a ₹40,000 budget.”

The system converts this input into a structured day-by-day plan that users can refine further.

---

### 3. Collaborative Group Trips

Trips in TLE are collaborative by design.

- Any user can create a trip
- Other users can request to join
- The trip creator decides who can participate

This keeps collaboration open while still giving full control to the trip owner.

Real-time updates ensure that changes like seat availability or join requests are reflected instantly.

---

## Technology Stack

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- GSAP and Framer Motion
- React Three Fiber / Drei

### Backend
- Java 17
- Spring Boot (Spring MVC)
- Hibernate / JPA

### Database & Services
- PostgreSQL 17 (hosted on Supabase)
- Supabase Authentication
- Supabase Realtime features

### External API ( AI Integration )
- Google Gemini API
- Used to assist with itinerary generation from text and images

---

## Getting Started

### Frontend

```bash
git checkout development
npm install
npm run dev
```

Create a `.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Backend

```bash
git checkout backend
```

Backend source code is located at:

```
src/main/java/com/travelbuddy/backend
```

---

## Design Decisions

- The product is built around **collaboration first**, not individual planning
- AI is used to speed up planning, not to replace user decisions
- Open collaboration is allowed, but the trip owner always has control

---

## Future Improvements

- Better budget handling
- More control over group permissions
- Smarter recommendations based on user preferences
- Direct booking integration

---

## Final Thoughts

TLE is about making trip planning less fragmented and more collaborative — closer to how people already plan trips in real life.

