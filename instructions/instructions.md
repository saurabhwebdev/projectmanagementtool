# Project Management App Instructions

## Overview
This lightweight, freemium project management app is designed for **freelancers** and **small teams** (up to 1 members in the free plan) and offers advanced features for premium users. Built using **React**, **Firebase**, and **Tailwind CSS**, the app focuses on **collaborative project management**, **task tracking**, and **agile workflows**, with scalability for larger teams through a premium subscription model.

---

## App Design and Development Details

### Technology Stack
- **Frontend**: React, Tailwind CSS (for styling and responsive design).
- **Backend**: Firebase (authentication, database, and hosting).
- **Authentication**: Firebase Authentication.
- **Payment Gateway**: Stripe (to be implemented post-MVP).

---

## UI/UX Design Guidelines

### Color Palette
**Primary Colors**:
- Light Blue: `#007BFF` (buttons, active states, primary highlights).
- White: `#FFFFFF` (background, modals, cards).

**Accent Colors**:
- Mint Green: `#34D399` (success indicators, call-to-actions like "Create Task").
- Coral Red: `#F87171` (error messages, task overdue).

**Neutral Colors**:
- Light Gray: `#F3F4F6` (background sections, form fields).
- Dark Gray: `#374151` (text, inactive buttons, secondary highlights).

---

### Typography
- **Font**:
  - Primary: `Inter` (clean, modern sans-serif font for all text).
  - Secondary: `Roboto Mono` (for code snippets, project IDs, and technical text).
- **Font Weights**:
  - Headings: `700` (bold).
  - Subheadings: `500` (medium).
  - Body: `400` (regular).
- **Font Sizes**:
  - H1: `32px`
  - H2: `24px`
  - Body: `16px`

---

### Animations
- **Smooth Transitions**:
  - Button hover: Scale-up effect with slight shadow (`transform: scale(1.05)`).
  - Page transitions: **Fade-in animations** using `framer-motion`.
- **Progress Indicators**:
  - Circular loaders for task completions.
  - Subtle pulsing effect for loading states.

---

### Iconography
- **Icon Pack**: Heroicons (free, clean, Tailwind-compatible).
- **Key Icons**:
  - Dashboard: `Chart Bar Icon`.
  - Projects: `Folder Icon`.
  - Tasks: `Check Circle Icon`.
  - Settings: `Cog Icon`.

---

### UI Components
**Dashboard**:
- **Card Layout**: Each project appears as a card with progress bars and key metrics.
- **Quick Actions**: Add buttons for "Create Project" and "Create Task" directly on the dashboard.

**Forms**:
- Use **rounded corners** for inputs (`border-radius: 0.375rem`).
- Inputs should have placeholder text with a light gray background (`#F3F4F6`).

**Buttons**:
- **Primary Buttons**:
  - Blue background, white text.
  - On hover: Slightly darker blue with a raised shadow.
- **Secondary Buttons**:
  - White background, gray text, gray border.
  - On hover: Light blue text with a blue border.

---

### Responsiveness
- **Mobile-first Design**:
  - Hamburger menu for navigation on small screens.
  - Swipeable Kanban boards.
- **Breakpoints**:
  - Small: `<640px`
  - Medium: `641px–1024px`
  - Large: `1025px+`

---

## Features

### Core Features (MVP)

#### 1. User Management
- **Roles**:
  - **Admin**: Full access, manage team and settings.
  - **Project Manager**: Manage projects and assign tasks.
  - **Developer**: View tasks and update progress.
  - **Stakeholder**: View-only access.
- **Team size**: Limited to 10 members in the free plan.

#### 2. Project Management
- **CRUD operations** for projects:
  - Title, Description, Start/End Date.
  - Priority Levels: High, Medium, Low.
  - Status: Active, On Hold, Completed.

#### 3. Task Management
- Task details: Title, Description, Due Date, Assigned User, Priority.
- **Subtasks** with dependencies.
- **Kanban board** for task movement.

#### 4. Agile Tools
- Sprint planning with backlog prioritization.
- Burn-down chart for tracking progress.

#### 5. Dashboard
- **Widgets**:
  - Tasks Due Today.
  - Completed Milestones.
  - Active Projects.

#### 6. Collaboration
- Task-level comments.
- Project wiki for shared notes.

---

### Post-MVP: Freemium Features
#### Free Plan:
- Up to 10 members.
- 500 MB storage.

#### Premium Plan:
- Unlimited members.
- Advanced analytics, API integrations, extended storage.

---

## Integration
- **Stripe for Payments**: Monthly and annual plans.

---

## Development Instructions

### Setup
1. Clone the repository and install dependencies:
   ```bash
   git clone <repo_url>
   cd project-management-app
   npm install
Configure Firebase:
Add Firebase API keys in .env.
Setup Firebase authentication and database.
Directory Structure
bash
Copy code
/src
  /components
    Header.js
    Sidebar.js
    KanbanBoard.js
  /pages
    Dashboard.js
    Projects.js
    Settings.js
  /styles
    Tailwind.css
Testing
Use React Testing Library for component tests.
Mock API responses for task CRUD operations.
Deployment
Deploy frontend using Firebase Hosting.
Switch to Stripe's production environment once traction is established.
Future Enhancements
Mobile app version (React Native).
Gamified elements (e.g., badges for task completion).
AI-powered suggestions (e.g., task prioritization).