
// http://localhost:3000/courses



import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import './output.css';
import Courselist from './Courselist';
import { Navbar } from './Navbar';
import { useDebounce } from './useDebounce'; // Import the custom hook
import { Searchbar } from './Searchbar';
import { useAuth } from './useAuth'; // Import authentication context

const Homepage = () => {
  const { isAuthenticated, onLogout } = useAuth(); // Use authentication context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce delay

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/courses'); // Replace with backend URL
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.topic.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [courses, debouncedSearchQuery]);

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
    console.log('Suggestion selected:', selectedTopic);
  };

  console.log("isauthenticated: ", isAuthenticated);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
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
        {/* Main Content */}
        <div className="container mx-auto p-6">
          {error ? (
            <div className="text-center text-red-500 font-semibold">{error}</div>
          ) : (
            <Courselist courses={filteredCourses} loading={loading} isAuthenticated={isAuthenticated} />
          )}
        </div>
        {/* Footer */}
        <footer className="bg-white shadow-md py-4 text-center">
          <p className="text-sm text-gray-500">&copy; 2025 AppStore. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Homepage;



















// http://localhost:3000/courses