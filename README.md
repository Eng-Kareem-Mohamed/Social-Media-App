# Route Academy - Modern Social Media Application

A modern, high-performance Social Media Web Application built with **React 19**, **React Compiler**, **TypeScript**, and **Tailwind CSS v4**. Developed as a production-grade project for Route Academy, powered by the official Route Posts REST API.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Profile Management
- **Full Authentication Suite**: Secure Sign Up, Sign In, and Password Management with JWT bearer authentication.
- **Dynamic Avatar Upload**: Direct Cloudflare R2 image upload with real-time profile picture synchronization.
- **User Profiles**: Panoramic cover design, joined dates, gender badges, and live statistical metrics.

### 2. 📰 Post Composer & Dynamic Feeds
- **Rich Post Creation**: Compose posts with formatted hashtags (`#topic`), user mentions (`@user`), and image attachments with real-time preview.
- **Multi-Category Feeds**:
  - **For You**: Global discovery feed with infinite pagination.
  - **Following**: Dedicated timeline displaying updates strictly from followed creators.
  - **My Posts**: Quick filter to review personal posts.
- **Full Post Lifecycle**: Update posts, delete with confirmation, and expand comments on demand.

### 3. ❤️ Engagement & Social Interactions
- **Optimistic Likes**: Instant like/unlike toggling with array-safe user identification.
- **Post Likes Modal**: Inspect all community members who liked a post with 1-click follow capabilities.
- **Bookmarks & Saved Collection**: Save posts to private bookmarks and view them in a dedicated grid.
- **Share Modal**: Share post links directly to the clipboard or external platforms.

### 4. 💬 Nested Comments & Replies
- **Multi-tier Discussions**: Top-level comments and nested reply threads.
- **Inline Comment Media**: Upload images directly into comments.
- **Comment Like System**: Like comments and replies with live count indicators.
- **Author Controls**: Edit or delete your own comments seamlessly.

### 5. 👥 Real-Time Follow System
- **Centralized Follow State**: Follow/Unfollow status is synchronized instantly across the entire application (Sidebars, User Profiles, Post Likes Modal, and Post Headers).
- **Follow Suggestions**: Live recommendations for fellow Route Academy students.
- **Live Counter Sync**: Real-time optimistic updates to follower/following counters on both personal and public profiles.

### 6. 🔔 Real-Time Notifications
- **Live Polling**: Background synchronization keeps unread badge counts up to date.
- **Interactive Notification Pods**: Jump directly to target posts or user profiles.
- **Batch Actions**: Mark individual alerts as read or mark all notifications in one click.
- **Engagement Statistics**: Live metrics displaying Total Alerts, Unread Alerts, and Read Completion rate.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React 19](https://react.dev/)
- **Optimization**: [React Compiler](https://react.dev/learn/react-compiler) (zero unnecessary re-renders)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Eng-Kareem-Mohamed/Social-Media-App.git

# Navigate to project directory
cd Social-Media-App

# Install dependencies
npm install
```

### Development Server
```bash
npm run dev
# or
npm start
```

### Production Build
```bash
npm run build
```

---

## 👤 Author
- **Eng. Kareem Mohamed** - [GitHub Profile](https://github.com/Eng-Kareem-Mohamed)
