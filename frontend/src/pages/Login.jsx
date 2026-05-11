import React, { useState } from 'react';
import { signIn } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await signIn(formData);
            localStorage.setItem('profile', JSON.stringify(data));
            toast.success("Welcome back!");
            navigate('/'); // Send them to home page
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-md mx-auto w-full px-6 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
                    <p className="text-center text-sm text-gray-600 mb-6">Sign in to access your Smart LPG dashboard and live alerts.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email" placeholder="Email" className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-200" onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        <input type="password" placeholder="Password" className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-200" onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition">Login</button>
                    </form>
                    <p className="mt-4 text-sm text-center text-gray-600">Don't have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Register</span></p>
                </div>
            </div>
        </div>
    );
};

export default Login;