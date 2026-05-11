import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const profile = JSON.parse(localStorage.getItem('profile'));

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">LPG</div>
                    <span className="text-xl font-bold text-gray-800">SmartLPG</span>
                </Link>

                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                    {profile ? (
                        <>
                            {profile.user.role === 'ngo' && (
                                <span className="text-green-600 font-semibold">Partner</span>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700 font-medium">Hi, {profile.user.name}</span>
                                <button onClick={logout} className="text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-50">Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/register" className="text-gray-700 hover:text-blue-700">Register</Link>
                            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;