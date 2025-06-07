import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Renderstars } from "./Renderstars"; // Assuming Renderstars is implemented
import { useNavigate } from "react-router-dom";
import { useDebounce } from "./useDebounce";
import { SkeletonCard } from "./SkeletonCard"; // Import the SkeletonCard component
import { Navbar } from "./Navbar";
import { useAuth } from "./useAuth";
import { Searchbar } from "./Searchbar";

const PurchasedCourses = () => {
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, handleLogout } = useAuth();
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce delay of 300ms

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        setLoading(true); // Start loading
        const response = await axios.get("http://localhost:3000/purchased-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data.purchasedCourses);
        setLoading(false); // Stop loading
      } catch (err) {
        setLoading(false); // Stop loading on error
        if (err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/signin");
        } else {
          setError(err.response?.data?.message || "An error occurred while fetching courses.");
        }
      }
    };

    fetchPurchasedCourses();
  }, [navigate]);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.topic.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [courses, debouncedSearchQuery]);

  // Generate suggestions for search bar
  const suggestions = useMemo(() => {
    const uniqueTopics = new Map();
    filteredCourses.forEach((course) => {
      if (!uniqueTopics.has(course.topic)) {
        uniqueTopics.set(course.topic, course);
      }
    });
    return Array.from(uniqueTopics.values()).slice(0, 5);
  }, [filteredCourses]);

  const onSuggestionClick = (selectedTopic) => {
    setSearchQuery(selectedTopic);
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <br />
        {/* Search Bar */} 
        <div className="flex-grow flex justify-center px-4">
          <div className="w-full min-w-[200px] max-w-[600px]">
            <Searchbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        </div>
        <div className="p-6 bg-gray-100">
          {/* Show Skeletons while loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(null).map((_, index) => (
                <SkeletonCard key={index} /> // Render skeleton cards
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-xl mt-6">No purchased courses found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const { stars, averageRating } = Renderstars(course.ratings.map(ratingObj => ratingObj.rating));
                return (
                  <div key={course.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
                    {/* Course Image */}
                    <div
                      className="w-full h-48 bg-gray-300 rounded-lg mb-4"
                      style={{
                        backgroundImage: `url(${course.images?.[0] || "/default-image.jpg"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                    {/* Course Title */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 truncate">{course.topic}</h2>
                    {/* Course Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    {/* Course Ratings */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">{stars}</div>
                      <span className="ml-4 text-gray-600 text-sm">
                        {course.ratings?.length || 0} reviews • ({averageRating.toFixed(1)} rating)
                      </span>
                    </div>
                    {/* Course Price */}
                    <div className="flex items-center mb-4">
                      <p className="text-2xl font-bold text-red-600">
                        ${course.discountedPrice ? (course.discountedPrice / 50).toFixed(2) : "0.00"}
                      </p>
                      <p className="line-through text-gray-500 text-sm ml-4">
                        ${course.actualPrice ? (course.actualPrice / 50).toFixed(2) : "0.00"}
                      </p>
                    </div>
                    {/* Start Now Button */}
                    <button
                      onClick={() => navigate(`/courses/${course.id}/videos`)}
                      className="mt-auto bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600"
                    >
                      Start Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PurchasedCourses;

// // http://localhost:3000/purchased-courses
