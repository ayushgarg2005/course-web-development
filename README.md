# Course Selling Web Application

A full-stack MERN platform where users can browse, purchase, and watch courses. It features a client-side cart, an AI chatbot assistant, secure JWT authentication, and a video learning portal.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Zod
- **AI Chatbot:** Python, Jupyter Notebook, ngrok

## Key Features

- **Course Marketplace:** Browse and search courses with a responsive UI.
- **Authentication:** Secure login/signup using JWT access and refresh tokens.
- **Video Portal:** Protected video player exclusively for purchased courses.
- **Ratings & Reviews:** Leave feedback and ratings on courses.
- **AI Chatbot:** A floating AI assistant to answer course-related questions.

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally or via Atlas
- Python (optional, if you want to run the chatbot backend)

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` folder and add the following variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/course_app
   JWT_SECRET=your_super_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   NGROK_CHAT_URL=https://your-ngrok-url.ngrok-free.app
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```
   *The API will run on `http://localhost:3000`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend/frontend-project
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Run the Tailwind CSS build script (leave this running in its own terminal):
   ```bash
   npm run build:css
   ```
4. Start the Vite development server (in another terminal):
   ```bash
   npm run dev
   ```
   *The web app will run on `http://localhost:5173`.*

## Author

**Ayush Garg**
GitHub: [@ayushgarg2005](https://github.com/ayushgarg2005)

📄 License
This project is open source and available under the MIT License.
