import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const { setSessionToken, setUserData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post(
        'https://constitution-ammendment-2p01.onrender.com/api/v1/auth/login',
        form
      );
      setSessionToken(res.data.sessionToken);
      setUserData({
        isAdmin: res.data.isAdmin,
        name: res.data.name
      });
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate(res.data.isAdmin ? '/vote' : '/vote'), 1500);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Invalid credentials', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1571321278340-39e4fe3c1f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md mx-4 border-t-8 border-blue-700 relative overflow-hidden">
        {/* Background decorations */}
        {/* Decorative element (bottom left only) */}
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-100 rounded-full opacity-20"></div>

        
        {/* Header with logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <img src="/nisb_white_logo.png" alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 font-serif">Constitution Amendment Portal</h2>
          <p className="text-gray-600 text-xs sm:text-sm">Secure login for registered voters</p>
          <div className="flex justify-center mt-3 sm:mt-4 space-x-4">
            <div className="w-1/3 h-1 bg-blue-600 rounded-full"></div>
            <div className="w-1/3 h-1 bg-red-600 rounded-full"></div>
            <div className="w-1/3 h-1 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Message alert */}
        {message.text && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-md border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm sm:text-base">{message.text}</span>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                placeholder="your.email@government.org"
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Secure Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 sm:py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-md flex items-center justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Authenticate & Proceed
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-gray-600 text-xs sm:text-sm">
            Not registered for constitutional voting?{' '}
            <Link to="/signup" className="text-blue-700 hover:underline font-medium">
              Request voting access
            </Link>
          </p>
          <div className="mt-3 sm:mt-4 text-xs text-gray-500">
            <p>By logging in, you agree to our constitutional voting terms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
