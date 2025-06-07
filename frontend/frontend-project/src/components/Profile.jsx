import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { Navbar } from './Navbar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, handleLogout } = useAuth();
  const navigate = useNavigate();

  // Get userId from localStorage
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage

  useEffect(() => {
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    // Fetch user profile data using axios
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/profile/${userId}`);
        setUserData(response.data); // Set fetched data in the state
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Could not fetch user profile.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <div className="text-center text-lg text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-lg text-red-600">{error}</div>;

  const goToCourseDetail = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <>
      <div className="bg-gray-100">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-16">
      <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-2/3 mx-auto p-16 bg-white rounded-lg shadow-lg">
          {/* Profile Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-semibold text-black">{userData.name}'s Profile</h1>
            <p className="text-2xl sm:text-3xl text-blue-700 mt-4">{userData.email}</p>
          </div>

          {/* Purchased Courses Section */}
          <div className="mt-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-blue-800 mb-8">Purchased Courses</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {userData.purchasedCourses.map(course => (
                <li
                  key={course.id}
                  onClick={() => goToCourseDetail(course.id)} // Redirect to course detail page
                  className="bg-white p-10 rounded-lg shadow-lg border border-gray-300 hover:border-blue-500 hover:cursor-pointer transition-all duration-300 ease-in-out"
                >
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-black">{course.topic}</h3>
                    <p className="text-gray-700 text-base sm:text-lg mt-3">{course.description}</p>
                    <p className="mt-6 text-xl sm:text-2xl font-semibold text-blue-600">
                      Price: ${course.discountedPrice || course.actualPrice}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;


// http://localhost:3000/profile/${userId}