import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1571321278340-39e4fe3c1f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="container mx-auto px-4 py-6 sm:py-12 flex flex-col items-center justify-center relative">

        {/* Main Content */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] max-w-md p-6 sm:p-8 border-t-8 relative overflow-hidden mt-16 sm:mt-20" style={{ borderTopColor: '#189AB4' }}>

          {/* Decorative elements */}
          {/* Decorative element (bottom left only) */}
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-red-100 rounded-full opacity-20"></div>


          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/nisb_white_logo.png"
                alt="Portal Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 font-serif">
             NISB Constitution Amendments Portal
            </h1>
            <div className="flex justify-center mt-2 space-x-2">
            <div className="w-1/3 h-1.5 bg-[#0B6073] rounded-full"></div> {/* Lighter than #05445E */}
<div className="w-1/3 h-1.5 bg-[#6FBFDD] rounded-full"></div> {/* Lighter than #88C9E0 */}
<div className="w-1/3 h-1.5 bg-[#BEE3E7] rounded-full"></div> {/* Lighter than #D4F1F4 */}

            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-gray-600 mb-5 text-sm">
            Amend what must be, Preserve what should be, Shape what could be.
            </p>
            <Link 
              to="/login" 
              className="inline-block text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg text-sm" style={{ backgroundColor: '#189AB4' }} // Darker than #0B6073
            >
              Get Started
            </Link>
            <p className="mt-4 text-gray-500 text-xs">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} NISB Constitution Amendments Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
