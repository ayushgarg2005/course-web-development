import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "./Navbar";
import { useAuth } from "./useAuth";

const CourseVideosPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAuthenticated, handleLogout } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/course/${courseId}/videos`);
        setVideos(response.data.videos);
      } catch (err) {
        setError("Failed to load course videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [courseId]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Course Videos</h1>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white p-4 rounded-lg shadow-md border cursor-pointer"
                onClick={() => navigate(`/course/${courseId}/video/${video.videoIndex}`)}
              >
                <img src={`/${video.thumbnail}`} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg mb-3" />
                <p className="text-gray-600"><strong>Topic:</strong> {video.title}</p>
                <p className="text-gray-600"><strong>Duration:</strong> {video.duration} minutes</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No videos available for this course.</p>
        )}
      </div>
    </>
  );
};

export default CourseVideosPage;

