import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAuth } from "./useAuth";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, handleLogout } = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const videoRef = useRef(null);

  // Validation error state
  const [ratingError, setRatingError] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(response.data);
        if (response.data.videos && response.data.videos.length > 0) {
          setCurrentVideo(response.data.videos[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  const handleVideoClick = (video) => {
    setCurrentVideo(video);

    // Ensure the video reloads when changed
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleReviewSubmit = async () => {
    setError("");
    setRatingError("");
    setCommentError("");

    let hasValidationError = false;
    if (rating === 0) {
      setRatingError("Please select a rating.");
      hasValidationError = true;
    }
    if (!comment.trim()) {
      setCommentError("Please add a comment.");
      hasValidationError = true;
    }
    if (hasValidationError) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please sign in.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.post(
        "http://localhost:3000/courses/review",
        { id: courseId, userId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourse((prevCourse) => ({
        ...prevCourse,
        ratings: response.data.ratings,
      }));

      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Review Submission Error:", err);
      setError(err.response?.data?.message || "Failed to submit review.");
    }
  };

  if (loading) return <div className="text-center text-xl">Loading course details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!course) return <div className="text-center text-xl">Course not found</div>;

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <div className="flex flex-col md:flex-row">
        {/* Video Topics Sidebar */}
        <div className="w-full md:w-1/4 bg-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Video Topics</h2>
          {course.videos.map((video) => (
            <div
              key={video.videoIndex}
              className={`cursor-pointer p-2 mb-2 rounded shadow text-sm md:text-base ${
                currentVideo?.videoIndex === video.videoIndex
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => handleVideoClick(video)}
            >
              {video.title}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">{course.topic}</h1>
          <p className="text-gray-600 text-sm md:text-lg mb-6">{course.description}</p>

          {currentVideo && (
            <div className="w-full max-w-3xl mx-auto rounded-lg mb-6 overflow-hidden">
              <video
                key={currentVideo.url} // Force re-render when video changes
                ref={videoRef}
                className="w-full aspect-video rounded-lg"
                controls
              >
                <source src={`/${currentVideo.url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Rate & Review Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Rate & Review this Course</h2>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border rounded-lg p-2 w-48 mb-2"
            >
              <option value={0}>Select Rating</option>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Not Bad</option>
              <option value={2}>2 - Bad</option>
              <option value={1}>1 - Terrible</option>
            </select>
            {ratingError && <p className="text-red-500 text-sm mb-2">{ratingError}</p>}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border rounded-lg p-2 mb-2 h-24"
            ></textarea>
            {commentError && <p className="text-red-500 text-sm mb-2">{commentError}</p>}

            <button onClick={handleReviewSubmit} className="bg-green-500 text-white py-2 px-4 rounded">
              Submit Review
            </button>
          </div>

          {/* Reviews Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            {course.ratings && course.ratings.length > 0 ? (
              course.ratings.map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200">
                  <p className="font-bold">{review.username}</p>
                  <div className="flex my-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetails;
