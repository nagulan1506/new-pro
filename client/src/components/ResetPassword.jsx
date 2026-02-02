import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [validToken, setValidToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                await api.get(`/verify-token/${token}`);
                setValidToken(true);
            } catch (err) {
                setValidToken(false);
                setError('Invalid or expired token.');
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            const res = await api.post('/reset-password', {
                token,
                newPassword
            });
            setMessage(res.data.message);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    if (loading) return <div className="text-light text-center">Verifying link...</div>;

    if (validToken === false) return (
        <div className="auth-container text-center">
            <h2 className="auth-title text-danger">Error</h2>
            <div className="alert alert-danger">{error}</div>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/forgot-password')}>
                Request New Link
            </button>
        </div>
    );

    return (
        <div className="auth-container">
            <h2 className="auth-title">Reset Password</h2>
            {message && <div className="alert alert-success">{message} Redirecting...</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
