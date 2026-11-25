import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ProfileSettings = ({ onProfileUpdated }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('/me');
                if (res.data?.user) {
                    setUsername(res.data.user.username || '');
                    setEmail(res.data.user.email || '');
                }
            } catch {
                toast.error('Failed to load profile details');
            }
        };
        loadProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (username.trim().length < 2) {
            toast.error('Username must be at least 2 characters.');
            return;
        }
        setSavingProfile(true);
        try {
            const res = await api.put('/me/update', {
                username: username.trim(),
                email: email.trim(),
            });
            const updatedUser = res.data?.user;
            if (updatedUser) {
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        id: updatedUser._id,
                        role: updatedUser.role,
                        username: updatedUser.username,
                    })
                );
                if (onProfileUpdated) onProfileUpdated(updatedUser);
            }
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match.');
            return;
        }

        setSavingPassword(true);
        try {
            const res = await api.put('/password/update', {
                oldPassword,
                newPassword,
                confirmPassword,
            });
            if (res.data?.token) {
                localStorage.setItem('token', res.data.token);
            }
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Profile Information</h2>
                <p className="text-xs text-gray-400 mb-5">Update your display name and email address</p>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={2}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl shadow hover:opacity-90 transition disabled:opacity-60"
                    >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Change Password</h2>
                <p className="text-xs text-gray-400 mb-5">Verify your current password to set a new one</p>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl shadow hover:bg-gray-800 transition disabled:opacity-60"
                    >
                        {savingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
