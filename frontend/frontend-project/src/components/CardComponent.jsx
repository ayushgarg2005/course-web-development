

import React, { useState } from "react";
import { Renderstars } from "./Renderstars";
import "./output.css";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const CardComponent = ({ course, isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stars, averageRating } = Renderstars(course.ratings.map(ratingObj => ratingObj.rating));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const userId = localStorage.getItem("userId");

  const handleCardClick = () => {
    if (location.pathname === `/course-detail/${course.id}`) return;
    navigate(`/course-detail/${course.id}`);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    setSelectedCourse(course);
  };

  const confirmPurchase = async (e) => {
    e.stopPropagation();
    if (!selectedCourse) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You need to be logged in to purchase a course.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/purchase",
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

  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 w-72 h-[400px] cursor-pointer flex flex-col justify-between"
      onClick={handleCardClick}
    >
      <div>
        {/* Updated Image Path */}
        <div
          className="w-full h-40 bg-gray-300 rounded-lg mb-3"
          style={{
            backgroundImage: `url(/${course.images[0] || "default-image.jpg"})`,
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

      {selectedCourse && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Purchase</h2>
            <p className="text-gray-700">
              Would you like to buy <strong>{selectedCourse.topic}</strong>?
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmPurchase}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Buy"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCourse(null);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
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

