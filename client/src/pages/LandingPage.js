import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="container mx-auto px-4 py-12 sm:py-24 flex flex-col items-center justify-center">
        {/* Main Content */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-4xl p-8 sm:p-12 border-t-8 border-blue-700 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-100 rounded-full opacity-20"></div>
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-700 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-2 sm:mb-4 font-serif">Constitutional Amendments Portal</h1>
            <div className="flex justify-center mt-4 sm:mt-6 space-x-4">
              <div className="w-1/3 h-1.5 bg-blue-600 rounded-full"></div>
              <div className="w-1/3 h-1.5 bg-red-600 rounded-full"></div>
              <div className="w-1/3 h-1.5 bg-blue-600 rounded-full"></div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Participate in shaping our nation's future by voting on proposed constitutional amendments.
            </p>
            <Link 
              to="/login" 
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Get Started
            </Link>
            <p className="mt-4 text-gray-500 text-xs sm:text-sm">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} Constitutional Amendments Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;