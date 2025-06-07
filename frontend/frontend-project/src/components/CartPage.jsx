import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Renderstars } from "./Renderstars";
import { Navbar } from "./Navbar";
import { useAuth } from "./useAuth";
const CartPage = () => {
  const [cartCourses, setCartCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, handleLogout } = useAuth();
  const userId=localStorage.getItem('userId');
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem(userId)) || [];
    setCartCourses(storedCart);
  }, []);

  const handleRemoveFromCart = (courseId) => {
    const updatedCart = cartCourses.filter((course) => course.id !== courseId);
    setCartCourses(updatedCart);
    localStorage.setItem(userId, JSON.stringify(updatedCart));
    toast.success("Course removed from cart.");
  };

  const handleBuyNowClick = (course) => {
    setSelectedCourse(course);
  };
const confirmPurchase = async () => {
    if (!selectedCourse) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
        toast.error("You need to be logged in to purchase a course.");
        return;
    }

    setIsProcessing(true);

    try {
        const response = await axios.post(
            "http://localhost:3000/purchase", // Replace with API URL
            { courseId: selectedCourse.id },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        toast.success(response.data.message || "Course purchased successfully!");
        
        // DO NOT REMOVE THE COURSE FROM THE CART
        // const updatedCart = cartCourses.filter((course) => course.id !== selectedCourse.id);
        // setCartCourses(updatedCart);
        // localStorage.setItem(userId, JSON.stringify(updatedCart));
        
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred while purchasing.");
    } finally {
        setSelectedCourse(null);
        setIsProcessing(false);
    }
};


  return (
    <>
    <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
    <div className="container mx-auto p-6">
      {/* <h1 className="text-3xl font-bold mb-6">Your Cart</h1> */}
      {cartCourses.length === 0 ? (
        <p className="text-gray-600">
          Your cart is empty. <Link to="/" className="text-blue-500">Go to Courses</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartCourses.map((course) => {
            const { stars, averageRating } = Renderstars(course.ratings.map(r => r.rating));
            return (
              <div key={course.id} className="bg-white shadow-lg rounded-lg p-6">
                <div
                  className="w-full h-48 bg-gray-300 rounded-lg mb-4"
                  style={{
                    backgroundImage: `url(${course.images[0] || '/default-image.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <h2 className="text-xl font-semibold">{course.topic}</h2>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">{stars}</div>
                  <span className="ml-4 text-gray-600 text-sm">({averageRating.toFixed(1)})</span>
                </div>
                <div className="flex items-center mb-4">
                  <p className="text-2xl font-bold text-red-600">${course.discountedPrice / 50}</p>
                  <p className="line-through text-gray-500 text-sm ml-12">${course.actualPrice / 50}</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleBuyNowClick(course)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleRemoveFromCart(course.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Purchase</h2>
            <p className="text-gray-700">Would you like to buy <strong>{selectedCourse.topic}</strong>?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmPurchase}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Buy"}
              </button>
              <button
                onClick={() => setSelectedCourse(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
    </>
  );
};

export default CartPage;

// // // http://localhost:3000/purchase

