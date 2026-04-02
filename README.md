# 📚 CourseHub — Full-Stack Course Selling Platform

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge)](https://zod.dev)

> A **full-stack online course marketplace** (think Udemy-lite) built with the MERN stack — featuring dual JWT authentication with silent token refresh, rate limiting, NoSQL injection protection, Zod schema validation, debounced search with autocomplete, an AI-powered chatbot, and a complete course system with video management, cart, purchase flow, and reviews.

🔗 **Repo:** [github.com/ayushgarg2005/course-web-development](https://github.com/ayushgarg2005/course-web-development)

---

## ⚡ Key Highlights (For Recruiters)

| Area | What Was Built |
|---|---|
| **Security** | Dual JWT (access + refresh tokens), bcrypt hashing, per-route rate limiting, NoSQL injection prevention |
| **Validation** | Zod schemas for every input — signup, signin, course creation, video upload, ratings |
| **Auth UX** | Silent token refresh via Axios interceptors — sessions never interrupt mid-use |
| **Performance** | Custom `useDebounce` hook + `useMemo` / `useCallback` to optimize search and re-renders |
| **Backend Design** | Clean route → middleware → model separation; named MongoDB connection with graceful SIGINT shutdown |
| **AI Integration** | Floating chatbot widget proxied through Express to an ngrok-exposed AI service |
| **Full Feature Set** | Cart (localStorage), purchase confirmation modal, purchased courses, reviews, profile, video library |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v7, React Toastify, FontAwesome |
| **State / Auth** | React Context API + custom `useAuth` hook |
| **HTTP Client** | Axios with request + response interceptors |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB + Mongoose (named connection via `createConnection`) |
| **Auth** | JWT access token (15 min) + refresh token (7 days) + bcrypt |
| **Validation** | Zod — server-side schema parsing for all inputs |
| **Security** | express-rate-limit, express-mongo-sanitize |
| **AI Chatbot** | Express proxy → external AI service via configurable ngrok URL |

---

## ✨ Features

### 🔐 Authentication & Security
- **Dual-token JWT**: Short-lived access tokens (15 min) paired with long-lived refresh tokens (7 days), stored per user in MongoDB
- **Silent auto-refresh**: Axios response interceptor detects `401 + expired: true`, calls `/refresh`, stores the new token pair, and retries the original request — completely invisible to the user
- **Secure logout**: Clears the refresh token in the database on logout, making old tokens unusable
- **bcrypt** password hashing
- **Zod validation** on every route input — malformed data is rejected before touching the database
- **Rate limiting**: Auth routes capped at 10 requests / 15 min (brute-force prevention); all other routes capped at 100 requests / 15 min
- **express-mongo-sanitize**: Strips `$` and `.` from all incoming request data, blocking NoSQL injection attacks like `{ "email": { "$gt": "" } }`

### 🎓 Course Platform
- Browse all courses on a responsive homepage grid with skeleton loading cards
- Debounced search bar (300 ms) with live autocomplete suggestions (deduped by topic, max 5 shown)
- Detailed course pages — description, discounted vs. actual price, "What You'll Learn" checklist, paginated reviews
- Full video library per course (title, URL, thumbnail, duration in `hh:mm:ss`, downloadable resources)
- Rating and review system — submit or update your review; star rating computed and displayed per course
- Cart stored in `localStorage` (keyed by `userId`) with add/remove and a purchase confirmation modal
- Purchased courses page — fetches all courses a user has bought from the backend
- User profile showing account details and purchased course list

### 🤖 AI Chatbot
- Floating collapsible widget rendered on every page via `App.jsx`
- Express `/chat` route acts as a proxy, forwarding queries and context to an external AI service
- AI service URL is environment-variable-driven (`NGROK_CHAT_URL`) for easy swap/deploy
- Session-scoped message history maintained in React state

### 📹 Video Management
- Full CRUD API for videos within any course: add, list all, fetch by index, update, delete

---

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              REACT FRONTEND  (Vite + Tailwind CSS)          │
│                                                             │
│  AuthProvider (Context)                                     │
│    ├─ Axios request interceptor  → attach Bearer token      │
│    └─ Axios response interceptor → silent refresh on 401    │
│                                                             │
│  Routes (React Router v7):                                  │
│    /                    → Homepage (search + course grid)   │
│    /signup  /signin     → Auth forms (redirect if authed)   │
│    /course-detail/:id   → Course info + reviews + sidebar   │
│    /courses/:id/videos  → Video player (protected)          │
│    /cart                → Cart page (protected)             │
│    /purchased-courses   → My courses (protected)            │
│    /profile             → User profile (protected)          │
│                                                             │
│  Custom Hooks: useAuth · useDebounce                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             EXPRESS SERVER  (Node.js / ES Modules)          │
│                                                             │
│  Global middleware:                                         │
│    express.json → cors → mongoSanitize → generalLimiter     │
│                                                             │
│  Routes:                                                    │
│    auth.routes.js    → /signup /signin /refresh /logout     │
│    course.routes.js  → /courses + /course/:id/video(s)      │
│    user.routes.js    → /profile /purchase /purchased-courses│
│    chat.routes.js    → /chat (AI proxy)                     │
│                                                             │
│  Middleware:                                                │
│    authenticate.js   → JWT verification, sets req.userId    │
│    validateCourse.js → Zod parse on course creation         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              MONGODB  (Named createConnection)              │
│                                                             │
│   Users    ─  name · email · hashedPassword                 │
│               purchasedCourses[] · refreshToken             │
│                                                             │
│   Courses  ─  topic · description · actualPrice            │
│               discountedPrice · videos[] · ratings[]        │
│               learnPoints[] · images[] · purchasedBy[]      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         EXTERNAL AI SERVICE  (ngrok tunnel)                 │
│         Chatbot notebook: Backend/chatbot.ipynb             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
resume-project/
│
├── Backend/
│   ├── config/
│   │   └── config.js               # Exports all env vars (JWT_SECRET, MONGO_URI, etc.)
│   ├── middleware/
│   │   ├── authenticate.js         # Verifies JWT, attaches decoded userId to req
│   │   ├── ratelimiter.js          # authLimiter (10/15m) + generalLimiter (100/15m)
│   │   └── validateCourse.js       # Zod middleware — parses course creation body
│   ├── models/
│   │   ├── User.js                 # Schema: name, email, password, purchasedCourses[], refreshToken
│   │   └── Course.js               # Schema: topic, prices, videos[], ratings[], learnPoints[], images[]
│   ├── routes/
│   │   ├── auth.routes.js          # Signup, signin, refresh, logout
│   │   ├── course.routes.js        # Course CRUD, video CRUD, reviews, feedback
│   │   ├── user.routes.js          # Profile, purchase, purchased-courses
│   │   └── chat.routes.js          # AI chatbot proxy
│   ├── schemas/
│   │   └── zodSchemas.js           # signupSchema, signinSchema, courseSchema, videoSchema, ratingSchema
│   ├── database.js                 # Named mongoose.createConnection + SIGINT graceful shutdown
│   ├── index.js                    # App bootstrap — middleware stack + route mounting
│   └── chatbot.ipynb               # Jupyter Notebook — AI chatbot prototype/experiments
│
└── frontend/frontend-project/
    ├── src/
    │   ├── components/
    │   │   ├── useAuth.jsx          # AuthContext: token storage, interceptors, refresh, logout
    │   │   ├── useDebounce.jsx      # Generic debounce hook using setTimeout/clearTimeout
    │   │   ├── Homepage.jsx         # Course listing + debounced search + memoized filtering
    │   │   ├── Searchbar.jsx        # Controlled input with dropdown suggestions
    │   │   ├── Courselist.jsx       # Responsive course grid with skeleton loading
    │   │   ├── CardComponent.jsx    # Course card — add-to-cart + navigate to detail
    │   │   ├── SkeletonCard.jsx     # Animated loading placeholder card
    │   │   ├── CourseDetailPage.jsx # Full course page: info, learn-points, reviews, sidebar
    │   │   ├── CourseDetails.jsx    # Video player page for purchased courses
    │   │   ├── CourseVideosPage.jsx # Video list for a purchased course
    │   │   ├── CartPage.jsx         # Cart from localStorage + purchase confirmation modal
    │   │   ├── PurchasedCourses.jsx # Fetches and displays user's purchased courses
    │   │   ├── Profile.jsx          # User profile + purchased course list
    │   │   ├── SignupForm.jsx        # Signup → POST /signup
    │   │   ├── SigninForm.jsx        # Signin → POST /signin
    │   │   ├── Navbar.jsx           # Responsive navbar (desktop + mobile)
    │   │   ├── DesktopNav.jsx       # Desktop navigation links
    │   │   ├── MobileNav.jsx        # Hamburger menu for mobile
    │   │   ├── Chatbot.jsx          # Floating AI chatbot widget (collapsible)
    │   │   ├── ChatMessage.jsx      # Individual chat bubble
    │   │   └── Renderstars.jsx      # Utility — computes average + star display from ratings[]
    │   ├── App.jsx                  # Route tree + AuthProvider + protected route guards
    │   └── main.jsx                 # React DOM entry point
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 📡 API Reference

### Auth — rate-limited to 10 req / 15 min per IP
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/signup` | Register user; returns access + refresh tokens | ❌ |
| `POST` | `/signin` | Login; returns access + refresh tokens | ❌ |
| `POST` | `/refresh` | Exchange refresh token for a new token pair | ❌ |
| `POST` | `/logout` | Nullify refresh token in DB | ✅ JWT |

### Courses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/courses` | Fetch all courses | ❌ |
| `GET` | `/courses/:id` | Fetch single course | ❌ |
| `POST` | `/courses` | Create course (Zod validated) | ❌ |
| `POST` | `/courses/review` | Submit or update a review | ✅ JWT |
| `GET` | `/courses/:courseId/feedback` | Fetch all reviews | ❌ |

### Video Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/course/:id/video` | Add video to a course |
| `GET` | `/course/:id/videos` | Get all videos for a course |
| `GET` | `/course/:id/video/:videoIndex` | Get single video |
| `PUT` | `/courses/:id/video/:videoIndex` | Update a video |
| `DELETE` | `/course/:id/video/:videoIndex` | Delete a video |

### User
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/profile/:userId` | Fetch user info + purchased courses | ❌ |
| `POST` | `/purchase` | Purchase a course | ✅ JWT |
| `GET` | `/purchased-courses` | List all courses purchased by user | ✅ JWT |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Proxy `{ query, context }` to AI service |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- Python 3 + Jupyter (for `chatbot.ipynb`)

### 1. Clone the repo
```bash
git clone https://github.com/ayushgarg2005/course-web-development.git
cd course-web-development
```

### 2. Backend setup
```bash
cd Backend
npm install

# Create .env
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/coursehub
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
PORT=3000
NGROK_CHAT_URL=https://your-ngrok-url    # optional — only needed for chatbot
EOF

node index.js
# ✅ Server running on http://localhost:3000
# ✅ MongoDB connected successfully
```

### 3. Frontend setup
```bash
cd frontend/frontend-project
npm install
npm run dev
# ✅ App running on http://localhost:5173
```

### 4. Tailwind CSS (only if editing styles)
```bash
npm run build:css   # watches input.css → output.css
```

---

## 🔒 Auth Flow — How It Works

```
REGISTER / LOGIN
  └─► Server creates:
        accessToken  = JWT signed with JWT_SECRET        (expires: 15m)
        refreshToken = JWT signed with JWT_REFRESH_SECRET (expires: 7d)
      refreshToken is saved to user document in MongoDB

FRONTEND (useAuth.jsx)
  └─► Both tokens stored in localStorage
  └─► Axios request interceptor → auto-attaches:
        Authorization: Bearer <accessToken>

WHEN ACCESS TOKEN EXPIRES
  └─► Server responds: { status: 401, expired: true }
  └─► Axios response interceptor catches this
  └─► Calls POST /refresh with stored refreshToken
  └─► Server validates refresh token against DB copy
  └─► Issues a new token pair → saved to localStorage
  └─► Original request retried automatically

LOGOUT
  └─► POST /logout → server sets user.refreshToken = null in MongoDB
  └─► localStorage cleared → redirect to /signin
```

---

## 🧰 Technical Decisions Worth Discussing in Interviews

**Why dual JWT (access + refresh tokens)?**  
Short-lived access tokens minimize exposure if a token is leaked — the attack window is only 15 minutes. Refresh tokens allow the session to persist without requiring re-login while being revocable server-side (by deleting the stored token).

**Why Zod for validation?**  
Zod schemas act as a single source of truth for both runtime validation and structural contracts. Error messages are clear and structured, making client-side handling straightforward. The `courseSchema` and `videoSchema` (with regex for `hh:mm:ss` duration format) show how validation scales beyond basic field checks.

**Why `mongoose.createConnection()` over `mongoose.connect()`?**  
Named connections make the database handle explicit in every model file (`dbConnection.model(...)`) instead of relying on Mongoose's global default. This is more maintainable, easier to test, and supports multi-database setups.

**Why `useDebounce` + `useMemo` for search?**  
Without debouncing, the filter function runs on every single keystroke. The custom `useDebounce` hook delays the search by 300 ms so filtering only happens after the user pauses typing. `useMemo` additionally ensures the filter result is only recomputed when either the query or the course list actually changes — not on every render.

**Why localStorage for the cart (keyed by userId)?**  
Cart state doesn't require a backend endpoint — it's stored locally per user, so each user's cart is isolated without any round-trip to the server. The tradeoff is that carts don't persist across devices, which is an acceptable limitation for this scope.

---

## 👨‍💻 Author

**Ayush Garg**  
B.Tech — Big Data & Cloud Computing, NSUT (Netaji Subhas University of Technology)

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ayushgarg2005)

---

## 📄 License

MIT — open source and free to use.
