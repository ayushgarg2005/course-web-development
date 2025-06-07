import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "./output.css";
import { Renderstars } from "./Renderstars";
import { Navbar } from "./Navbar";
import { useAuth } from "./useAuth";
import CardComponent from "./CardComponent";

const CourseDetailPage = () => {
  const { isAuthenticated, handleLogout } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleComments, setVisibleComments] = useState(2);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details.");
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!course) return <p className="text-center text-gray-500">Course not found.</p>;

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <br />
      <div className="max-w-7xl mx-auto p-8 flex gap-8">
        <div className="flex-1">
          {/* Course Title & Description */}
          <h1 className="text-4xl font-extrabold text-gray-900">{course.topic}</h1>
          <p className="text-gray-700 mt-3 text-lg leading-relaxed">{course.description}</p>

          {/* Price & Ratings */}
          <div className="flex items-center justify-between mt-6 border-b pb-4">
            <div className="flex items-center">
              <p className="text-2xl font-bold text-red-600">${course.discountedPrice / 50}</p>
            </div>
            <div className="flex items-center">
              {course.ratings?.length > 0 ? (
                <>
                  <div className="flex items-center">
                    {Renderstars(course.ratings.map((r) => r.rating)).stars}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    ({Renderstars(course.ratings.map((r) => r.rating)).averageRating.toFixed(1)})
                  </span>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No ratings yet</p>
              )}
            </div>
          </div>

          {/* What You'll Learn */}
          {course.learnPoints?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learnPoints.map((point, index) => (
                  <div key={index} className="flex items-center text-gray-700 text-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-3" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Comments */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Reviews</h2>
            {course.ratings?.length > 0 ? (
              <div className="space-y-4">
                {course.ratings.slice(0, visibleComments).map((rating, index) => {
                  const { stars } = Renderstars([rating.rating]);
                  return (
                    <div key={index} className="bg-gray-100 p-4 rounded-md shadow-md">
                      <p className="font-bold text-gray-900">{rating.username}</p>
                      <div className="flex items-center mt-1">{stars}</div>
                      {rating.comment && (
                        <p className="text-gray-700 mt-2">💬 {rating.comment}</p>
                      )}
                    </div>
                  );
                })}
                <div className="flex gap-3 mt-3">
                  {visibleComments < course.ratings.length && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                      onClick={() => setVisibleComments((prev) => prev + 2)}
                    >
                      Show More
                    </button>
                  )}
                  {visibleComments > 2 && (
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                      onClick={() => setVisibleComments(2)}
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No comments yet</p>
            )}
          </div>
        </div>

        {/* Course Details Sidebar */}
        <div>
          <CardComponent course={course} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
