import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Navbar } from './Navbar';
import { useAuth } from './useAuth';

const AddCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole, handleLogout } = useAuth();
  const isEditMode = !!courseId;

  const [courseData, setCourseData] = useState({
    id: '',
    topic: '',
    description: '',
    actualPrice: 0,
    discountedPrice: 0,
    images: [],
    learnPoints: [],
    videos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchCourseData = async () => {
        try {
          const response = await axios.get(`/courses/${courseId}`);
          setCourseData(response.data);
        } catch (error) {
          toast.error("Failed to load course data for editing");
          console.error(error);
        }
      };
      fetchCourseData();
    }
  }, [courseId, isEditMode]);

  // Protected access check
  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied: Admins Only</h1>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: (name === 'actualPrice' || name === 'discountedPrice') ? parseFloat(value) : value
    }));
  };

  const handleArrayChange = (index, value, arrayName) => {
    const newArray = [...courseData[arrayName]];
    newArray[index] = value;
    setCourseData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const addArrayItem = (arrayName) => {
    setCourseData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    const newArray = [...courseData[arrayName]];
    newArray.splice(index, 1);
    setCourseData(prev => ({ ...prev, [arrayName]: newArray }));
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...courseData.videos];
    newVideos[index][field] = field === 'videoIndex' ? parseInt(value) : value;
    setCourseData(prev => ({ ...prev, videos: newVideos }));
  };

  const addVideo = () => {
    setCourseData(prev => ({
      ...prev,
      videos: [...prev.videos, {
        title: '',
        url: '',
        thumbnail: '',
        duration: '00:00:00',
        videoIndex: prev.videos.length,
      }]
    }));
  };

  const removeVideo = (index) => {
    const newVideos = [...courseData.videos];
    newVideos.splice(index, 1);
    setCourseData(prev => ({ ...prev, videos: newVideos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out empty arrays and invalid modules
      const filteredImages = courseData.images.filter(img => img.trim() !== '');
      // Prepare data for submission: filter out empty points/images/videos
      const filteredVideos = courseData.videos.filter(v => v.title && v.url);
      
      const { _id, __v, ...pureCourseData } = courseData;

      const finalData = {
        ...pureCourseData,
        learnPoints: (courseData.learnPoints || []).filter(p => p && p.trim() !== ""),
        images: (courseData.images || []).filter(img => img && img.trim() !== ""),
        videos: filteredVideos.length > 0 ? filteredVideos : undefined,
      };
      
      if (isEditMode) {
        await axios.put(`/courses/${courseId}`, finalData);
        toast.success('Course updated successfully!');
      } else {
        await axios.post('/courses', finalData);
        toast.success('Course published successfully!');
      }
      navigate('/');
    } catch (error) {
      // Detailed error logging
      const backendErrors = error.response?.data?.errors;
      let errorMsg = 'Error occurred';
      
      if (backendErrors && Array.isArray(backendErrors)) {
        errorMsg = backendErrors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      } else {
        errorMsg = error.response?.data?.message || error.message;
      }

      toast.error(`Publishing Failed: ${errorMsg}`);
      console.error('Error adding course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-white shadow-xl rounded-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          {isEditMode ? '📝 Edit Course' : '✨ Create New Course'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course ID</label>
              <input
                type="text"
                name="id"
                value={courseData.id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., nodejs-masterclass"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                name="topic"
                value={courseData.topic}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Course title"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-blue-500"
              placeholder="What is this course about?"
              required
            />
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-1">Actual Price (INR)</label>
              <input
                type="number"
                name="actualPrice"
                value={courseData.actualPrice}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-blue-600 mt-1">Displayed as ${courseData.actualPrice / 50}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-800 mb-1">Discounted Price (INR)</label>
              <input
                type="number"
                name="discountedPrice"
                value={courseData.discountedPrice}
                onChange={handleInputChange}
                className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-blue-600 mt-1">Displayed as ${courseData.discountedPrice / 50}</p>
            </div>
          </div>

          {/* Arrays Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <h3 className="font-bold text-gray-700">Image URLs</h3>
                <button type="button" onClick={() => addArrayItem('images')} className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">+ Add Image</button>
              </div>
              <div className="space-y-2">
                {courseData.images.map((img, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={img}
                      onChange={(e) => handleArrayChange(idx, e.target.value, 'images')}
                      className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="URL to image"
                    />
                    {courseData.images.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeArrayItem(idx, 'images')} 
                        className="text-red-500 hover:text-red-700 p-2 text-xl leading-none"
                        title="Remove Image"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learn Points */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <h3 className="font-bold text-gray-700">What Students Learn</h3>
                <button type="button" onClick={() => addArrayItem('learnPoints')} className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">+ Add Point</button>
              </div>
              <div className="space-y-2">
                {courseData.learnPoints.map((pt, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleArrayChange(idx, e.target.value, 'learnPoints')}
                      className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Point detail"
                    />
                    {courseData.learnPoints.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeArrayItem(idx, 'learnPoints')} 
                        className="text-red-500 hover:text-red-700 p-2 text-xl leading-none"
                        title="Remove Point"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Videos Section */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between items-center">
              Module Videos
              <button type="button" onClick={addVideo} className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">+ Add Module Video</button>
            </h3>
            
            <div className="space-y-6">
              {courseData.videos.map((video, idx) => (
                <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm group">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h4 className="font-bold text-gray-600">Video Module #{idx + 1}</h4>
                    {courseData.videos.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeVideo(idx)} 
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remove Module
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                      <input
                        type="text"
                        placeholder="Video Title"
                        value={video.title}
                        onChange={(e) => handleVideoChange(idx, 'title', e.target.value)}
                        className="w-full p-2 border rounded text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Duration</label>
                      <input
                        type="text"
                        placeholder="hh:mm:ss"
                        value={video.duration}
                        onChange={(e) => handleVideoChange(idx, 'duration', e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Video URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={video.url}
                        onChange={(e) => handleVideoChange(idx, 'url', e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Thumbnail URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={video.thumbnail}
                        onChange={(e) => handleVideoChange(idx, 'thumbnail', e.target.value)}
                        className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="pt-10 flex flex-col items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-80 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{isEditMode ? '✅' : '🚀'}</span>
                <span className="text-xl">
                  {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Course' : 'Publish Course')}
                </span>
              </div>
            </button>
            <p className="mt-4 text-sm text-gray-500 italic">
              * Make sure all required fields are filled before publishing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
