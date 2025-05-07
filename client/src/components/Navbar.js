import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-white shadow-md py-4 px-6 flex justify-center gap-6 text-lg font-medium text-gray-700">
    <Link to="/" className="hover:text-blue-600 transition">Login</Link>
    <Link to="/signup" className="hover:text-green-600 transition">Signup</Link>
    <Link to="/vote" className="hover:text-purple-600 transition">Vote</Link>
  </nav>
);

export default Navbar;
