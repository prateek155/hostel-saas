import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AuthStyles.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setnewPassword] = useState("");
    const [answer, setAnswer] = useState("");
    const navigate = useNavigate();

    // form function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`https://ulcclub1.onrender.com/api/v1/auth/forgot-password`, {
                email,
                newPassword,
                answer
            });
            if (res && res.data.success) {
                toast.success(res.data && res.data.message);
                navigate("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error)
            toast.error("Something went wrong");
        }
    };

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }

                .modern-forgot-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    position: relative;
                }

                .modern-forgot-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                    backdrop-filter: blur(10px);
                }

                .forgot-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.1),
                        0 0 0 1px rgba(255, 255, 255, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.7);
                    padding: 48px 40px;
                    width: 100%;
                    max-width: 420px;
                    position: relative;
                    z-index: 1;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .forgot-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 
                        0 30px 60px rgba(0, 0, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.7);
                }

                .forgot-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1a202c;
                    text-align: center;
                    margin-bottom: 12px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .forgot-subtitle {
                    color: #718096;
                    text-align: center;
                    margin-bottom: 40px;
                    font-size: 16px;
                    font-weight: 400;
                    line-height: 1.5;
                }

                .form-group {
                    margin-bottom: 24px;
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 500;
                    color: #2d3748;
                    background: rgba(255, 255, 255, 0.8);
                    transition: all 0.3s ease;
                    outline: none;
                }

                .form-input:focus {
                    border-color: #667eea;
                    background: rgba(255, 255, 255, 1);
                    box-shadow: 
                        0 0 0 3px rgba(102, 126, 234, 0.1),
                        0 4px 12px rgba(102, 126, 234, 0.15);
                    transform: translateY(-2px);
                }

                .form-input::placeholder {
                    color: #a0aec0;
                    font-weight: 400;
                }

                .btn {
                    width: 100%;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: none;
                    letter-spacing: 0.5px;
                    position: relative;
                    overflow: hidden;
                    margin-top: 12px;
                }

                .btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: left 0.5s;
                }

                .btn:hover::before {
                    left: 100%;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .btn-primary:hover {
                    background: linear-gradient(135deg, #5a67d8, #6b46c1);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                }

                .btn-primary:active {
                    transform: translateY(0);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                }

                .back-to-login {
                    text-align: center;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .back-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .back-link:hover {
                    color: #5a67d8;
                    transform: translateX(-3px);
                }

                .floating-elements {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                }

                .floating-element {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: float 6s ease-in-out infinite;
                }

                .floating-element:nth-child(1) {
                    width: 80px;
                    height: 80px;
                    top: 10%;
                    left: 10%;
                    animation-delay: 0s;
                }

                .floating-element:nth-child(2) {
                    width: 60px;
                    height: 60px;
                    top: 70%;
                    right: 10%;
                    animation-delay: 2s;
                }

                .floating-element:nth-child(3) {
                    width: 40px;
                    height: 40px;
                    bottom: 20%;
                    left: 20%;
                    animation-delay: 4s;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                        opacity: 0.8;
                    }
                }

                .security-icon {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 24px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
                }

                .security-icon::after {
                    content: '🔐';
                    font-size: 24px;
                }

                @media (max-width: 480px) {
                    .forgot-card {
                        padding: 32px 24px;
                        margin: 20px;
                    }
                    
                    .forgot-title {
                        font-size: 28px;
                    }
                    
                    .form-input, .btn {
                        padding: 14px 18px;
                    }
                }
            `}</style>

            <Layout title={'Forgot Password - M-Group App'}>
                <div className="modern-forgot-container">
                    <div className="floating-elements">
                        <div className="floating-element"></div>
                        <div className="floating-element"></div>
                        <div className="floating-element"></div>
                    </div>

                    <div className="forgot-card">
                        <ToastContainer
                            position="top-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />

                        <div className="security-icon"></div>

                        <form onSubmit={handleSubmit}>
                            <h1 className="forgot-title">Reset Password</h1>
                            <p className="forgot-subtitle">
                                Enter your email, PRN, and new password to reset your account
                            </p>

                            <div className="form-group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter your PRN"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setnewPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter your new password"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary">
                                Reset Password
                            </button>
                        </form>

                        <div className="back-to-login">
                            <a 
                                href="/login" 
                                className="back-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/login");
                                }}
                            >
                                ← Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ForgotPassword;