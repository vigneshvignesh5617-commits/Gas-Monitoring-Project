import React, { useState } from 'react';
import { signUp } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QrCode } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: 'user', address: '', phone: '', registrationNumber: '',
        // IoT fields
        deviceId: '', provider: 'Indane', consumerNumber: '', language: 'English', cylinderType: '14.2kg', customTare: '',
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signUp(formData);
            toast.success("Registration Successful! Please Login.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center">
            <div className="max-w-4xl mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="hidden lg:block">
                        <div className="bg-green-50 p-8 rounded-xl shadow-inner">
                            <h2 className="text-3xl hero-title text-green-600 mb-4">Join SmartLPG</h2>
                            <p className="text-gray-600">Register to monitor your LPG cylinder, receive alerts, or partner to provide refill services.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Create Account & Link Device</h2>

                        <select 
                            className="w-full p-3 mb-4 border rounded focus:ring-2 focus:ring-blue-200"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="user">Individual (Household)</option>
                            <option value="ngo">Partner (Service Provider)</option>
                        </select>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            <input type="email" placeholder="Email" className="w-full p-3 border rounded" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <input type="password" placeholder="Password" className="w-full p-3 border rounded" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                            <input type="text" placeholder="Phone Number" className="w-full p-3 border rounded" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>

                        <textarea placeholder="Address" className="w-full p-3 mt-4 border rounded" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />

                        {/* Device linking */}
                        <div className="mt-4">
                            <label className="text-sm text-slate-600">Device Serial Number / ID</label>
                            <div className="mt-2 flex items-center gap-2">
                                <input type="text" placeholder="e.g., GG-1024" className="flex-1 p-3 border rounded" value={formData.deviceId} onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })} />
                                <button type="button" onClick={() => {
                                    const scanned = window.prompt('Scan QR (paste device ID)');
                                    if (scanned) setFormData(fd => ({ ...fd, deviceId: scanned }));
                                }} className="p-2 bg-gray-100 rounded border hover:bg-gray-200 flex items-center gap-2">
                                    <QrCode size={18} /> <span className="text-sm">Scan QR to Pair</span>
                                </button>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Keep the device ID handy — this links your physical stand to your account.</div>
                        </div>

                        {/* LPG Provider & consumer number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="text-sm text-slate-600">Service Provider</label>
                                <select className="w-full p-3 mt-2 border rounded" value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })}>
                                    <option>Indane</option>
                                    <option>HP Gas</option>
                                    <option>Bharat Gas</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Consumer Number</label>
                                <input className="w-full p-3 mt-2 border rounded" placeholder="Provider consumer number" value={formData.consumerNumber} onChange={(e) => setFormData({ ...formData, consumerNumber: e.target.value })} />
                            </div>
                        </div>

                        {/* Language + Calibration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="text-sm text-slate-600">Language Preference</label>
                                <select className="w-full p-3 mt-2 border rounded" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Spanish</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Cylinder Type</label>
                                <select className="w-full p-3 mt-2 border rounded" value={formData.cylinderType} onChange={(e) => setFormData({ ...formData, cylinderType: e.target.value })}>
                                    <option value="14.2kg">14.2 kg (Domestic)</option>
                                    <option value="19kg">19 kg (Commercial)</option>
                                    <option value="custom">Custom (enter tare)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Custom Tare Weight (kg)</label>
                                <input className="w-full p-3 mt-2 border rounded" placeholder="e.g., 15.8" value={formData.customTare} onChange={(e) => setFormData({ ...formData, customTare: e.target.value })} />
                            </div>
                        </div>

                        {formData.role === 'ngo' && (
                            <input type="text" placeholder="NGO / Provider Registration Number" className="w-full p-3 mt-4 border rounded border-blue-400" value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} required />
                        )}

                        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded mt-6 hover:bg-blue-700 transition">Create Account & Pair Device</button>
                        <p className="mt-4 text-sm text-center text-gray-600">Already have an account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/login')}>Login</span></p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;