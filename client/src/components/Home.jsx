import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    return (
        <div className="auth-container">
            <h2 className="auth-title">Welcome Back</h2>
            <form>
                <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input type="email" className="form-control" placeholder="Enter your email" />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="Enter your password" />
                </div>
                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Login</button>
                </div>
                <div className="mt-3 text-center">
                    <Link to="/forgot-password">Forgot Password?</Link>
                </div>
            </form>
        </div>
    );
};

export default Home;
