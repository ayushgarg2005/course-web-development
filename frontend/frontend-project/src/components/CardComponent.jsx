import React, { useState } from "react";
import { Renderstars } from "./Renderstars";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./useAuth";

const CardComponent = ({ course, isAuthenticated }) => {
  const { userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { stars, averageRating } = Renderstars(course.ratings.map(ratingObj => ratingObj.rating));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userId = localStorage.getItem("userId");

  const handleCardClick = () => {
    const targetId = encodeURIComponent(course._id || course.id);
    if (location.pathname === `/course-detail/${course.id}` || location.pathname === `/course-detail/${targetId}`) return;
    navigate(`/course-detail/${targetId}`);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    setSelectedCourse(course);
  };

  const confirmPurchase = async (e) => {
    e.stopPropagation();
    if (!selectedCourse) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to be logged in to purchase a course.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/purchase",
        { courseId: selectedCourse.id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Course purchased successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
      setSelectedCourse(null);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to add courses to the cart.");
      return;
    }
    let cart = JSON.parse(localStorage.getItem(userId)) || [];
    const existingCourse = cart.find((item) => item.id === course.id);

    if (!existingCourse) {
      cart.push(course);
      localStorage.setItem(userId, JSON.stringify(cart));
      toast.success("Course added to cart!");
    } else {
      toast.info("Course is already in the cart.");
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      // Use the configured axios instance which has baseURL and interceptors
      await axios.delete(`/courses/${encodeURIComponent(course._id || course.id)}`);
      toast.success("Course deleted successfully");
      window.location.reload(); // Refresh to show updated list
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete course. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/edit-course/${encodeURIComponent(course._id || course.id)}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 w-72 h-[400px] cursor-pointer flex flex-col justify-between relative group"
      onClick={handleCardClick}
    >
      {/* Admin Actions Overlay: Show if admin AND (is creator OR course is legacy) */}
      {userRole === "admin" && (!course.createdBy || userId?.toString() === course.createdBy?.toString()) && (
        <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEditClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-md transition transform hover:scale-110"
            title="Edit Course"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition transform hover:scale-110"
            title="Delete Course"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      )}

      <div>
        {/* Course Image */}
        <div
          className="w-full h-40 bg-gray-300 rounded-lg mb-3"
          style={{
            backgroundImage: `url(${course.images?.[0] || "/default-image.jpg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <h2 className="text-lg font-bold text-gray-800 truncate w-full mb-3" title={course.topic}>
          {course.topic}
        </h2>

        <p className="text-gray-600 text-sm text-left mb-2 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center text-left mb-2">
          <div className="flex items-center">{stars}</div>
          <span className="ml-2 text-gray-600 text-sm">
            ({averageRating.toFixed(1)})
          </span>
        </div>

        <div className="flex items-center text-left mb-2">
          <p className="text-xl font-bold text-red-600">${course.discountedPrice / 50}</p>
          <p className="line-through text-gray-500 text-sm ml-8">
            ${course.actualPrice / 50}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleBuyNowClick}
          className="bg-blue-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-blue-600 flex-grow"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Buy Now"}
        </button>

        <button
          onClick={handleAddToCart}
          className="bg-green-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-green-600 flex-grow"
        >
          Add to Cart
        </button>
      </div>

      {/* Purchase Confirmation Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-[100]"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Purchase</h2>
            <p className="text-gray-600 text-lg">
              Would you like to buy <span className="text-blue-600 font-semibold">{selectedCourse.topic}</span>?
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={confirmPurchase}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Yes, Buy"}
              </button>
              <button
                onClick={() => setSelectedCourse(null)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-[100]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-red-500 text-5xl mb-4 text-center">
              <FontAwesomeIcon icon={faTrashAlt} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Confirm Deletion</h2>
            <p className="text-gray-600 text-center text-lg mb-8">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{course.topic}"</span>? This action cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Permanently Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CardComponent;

