import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './output.css';
import { Navbar } from './Navbar';
import { useAuth } from './useAuth';
import axios from 'axios';

const SignupForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, handleAuthSuccess, handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post('/signup', formData);

      handleAuthSuccess({
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
        userId:       data.userId,
      });

      setMessage(data.message);
      setError('');
      navigate('/');
    } catch (err) {
      setMessage('');
       if (err.response?.status === 429) {
        setError('Too many attempts. Please wait 15 minutes and try again.');
        return;
  }
      setError(err.response?.data?.message || 'Something went wrong');
    }
    finally{
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-md">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
               disabled={submitting}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:from-green-500 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Please wait...' : 'Sign Up'}
            </button>
          </form>
          {message && <p className="mt-4 text-green-700 text-center text-sm">{message}</p>}
          {error   && <p className="mt-4 text-red-700   text-center text-sm">{error}</p>}
        </div>
      </div>
    </>
  );
};

export default SignupForm;
