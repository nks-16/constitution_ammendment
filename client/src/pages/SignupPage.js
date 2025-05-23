import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';


const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await axios.post('https://constitution-ammendment-2p01.onrender.com/api/v1/auth/signup', form);
      setMessage({ text: 'Registration successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Registration failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1571321278340-39e4fe3c1f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="bg-white bg-opacity-90 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto border-t-8  relative overflow-hidden" style={{ borderTopColor: '#189AB4' }}>
        {/* Background decorations */}
        {/* Decorative element (bottom left only) */}
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-100 rounded-full opacity-20"></div>


        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            {/* Local Logo Image */}
            <img src="/nisb_white_logo.png" alt="Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 font-serif">Voter Registration</h2>
          <p className="text-gray-600 text-sm">Apply for voting access</p>
          <div className="flex justify-center mt-4 space-x-4">
          <div className="w-1/3 h-1.5 bg-[#0B6073] rounded-full"></div> {/* Lighter than #05445E */}
<div className="w-1/3 h-1.5 bg-[#6FBFDD] rounded-full"></div> {/* Lighter than #88C9E0 */}
<div className="w-1/3 h-1.5 bg-[#BEE3E7] rounded-full"></div> {/* Lighter than #D4F1F4 */}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-md border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-base">{message.text}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="As per government records"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="your.email@domain.com"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full  text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-[1.01] shadow-md" style={{ backgroundColor: '#189AB4' }}
          >
            Register for Voting
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Already have voting access?{' '}
            <Link to="/login" className="text-blue-700 hover:underline font-medium">
              Login to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
