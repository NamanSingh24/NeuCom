import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    const [currentMode, setCurrentMode] = useState('login');

    const switchMode = (mode) => {
        setCurrentMode(mode);
    };
   const Nav = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        if (currentMode === 'signup' && data.password !== data.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Simulate API call
        console.log(`${currentMode} attempt:`, data);
        
        // Add loading state
        const submitBtn = document.getElementById('auth_submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert(`${currentMode === 'login' ? 'Login' : 'Account creation'} successful!`);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            Nav('/'); // 
        }, 2000);
    };

    const handleForgotPassword = () => {
        const email = prompt('Enter your email address to reset password:');
        if (email) {
            alert(`Password reset link sent to ${email}`);
        }
    };

    const handleSocialLogin = (provider) => {
        alert(`Redirecting to ${provider} authentication...`);
        // Implement OAuth flow here
    };

    useEffect(() => {
      const handleMouseMove = (e) => {
          const mouseX = (e.clientX / window.innerWidth - 0.5) * 40;
          const mouseY = (e.clientY / window.innerHeight - 0.5) * 40;
          
          const neuralNetwork = document.querySelector('.auth_neural_network');
          if (neuralNetwork) {
              neuralNetwork.style.transform = `perspective(1000px) rotateX(${-mouseY * 0.1}deg) rotateY(${mouseX * 0.1}deg) translate3d(${mouseX}px, ${mouseY}px, 0)`;
          }
      };

      window.addEventListener('mousemove', handleMouseMove);
      
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
      };
  }, []);


  const renderNeuralNetwork = () => {
    const nodes = [];
    const connections = [];
    const colors = ['#00d4ff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'];
    
    // Create more nodes
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1200;
        const y = Math.random() * 800;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 2 + Math.random() * 3;
        
        nodes.push(
            <circle 
                key={`node-${i}`}
                cx={x} 
                cy={y} 
                r={size} 
                fill={color} 
                filter="url(#auth_glow)" 
                opacity={0.6 + Math.random() * 0.4}
            />
        );

        // Create connections between nodes
        if (i > 0) {
            const prevNode = nodes[i - 1];
            connections.push(
                <line 
                    key={`connection-${i}`}
                    x1={prevNode.props.cx} 
                    y1={prevNode.props.cy}
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth="0.5"
                    opacity="0.3"
                />
            );
        }
    }
    return (
      <svg className="auth_neural_network" viewBox="0 0 1200 800">
          <defs>
              <filter id="auth_glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                  </feMerge>
              </filter>
          </defs>
          {connections}
          {nodes}
      </svg>
  );
};
    return (
        <div className="auth_body">
            <div className="auth_background"></div>
            
            {/* Neural Network Background */}
            {renderNeuralNetwork()}

            <div className={`auth_container ${currentMode === 'signup' ? 'auth_signup_mode' : ''}`} id="auth_container">
                <div className="auth_logo">
                    <h1 className="auth_logo_title">NeuCom</h1>
                    <p className="auth_logo_subtitle">AI-Powered Document Intelligence</p>
                </div>

                <div className="auth_toggle_container">
                    <div 
                        className={`auth_toggle_slider ${currentMode === 'signup' ? 'signup' : ''}`} 
                        id="auth_toggleSlider"
                    ></div>
                    <button 
                        className={`auth_toggle_btn ${currentMode === 'login' ? 'active' : ''}`} 
                        id="auth_loginBtn" 
                        onClick={() => switchMode('login')}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth_toggle_btn ${currentMode === 'signup' ? 'active' : ''}`} 
                        id="auth_signupBtn" 
                        onClick={() => switchMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form id="auth_form" onSubmit={handleSubmit}>
                    <div className="auth_signup_fields">
                        <div className="auth_form_group">
                            <label className="auth_form_label" htmlFor="auth_fullName">Full Name</label>
                            <input 
                                type="text" 
                                id="auth_fullName" 
                                className="auth_form_input"
                                name="fullName" 
                                placeholder="Enter your full name" 
                                required={currentMode === 'signup'}
                            />
                            <span className="auth_input_icon">👤</span>
                        </div>
                    </div>

                    <div className="auth_form_group">
                        <label className="auth_form_label" htmlFor="auth_email">Email Address</label>
                        <input 
                            type="email" 
                            id="auth_email" 
                            className="auth_form_input"
                            name="email" 
                            placeholder="Enter your email" 
                            required
                        />
                        <span className="auth_input_icon">📧</span>
                    </div>

                    <div className="auth_form_group">
                        <label className="auth_form_label" htmlFor="auth_password">Password</label>
                        <input 
                            type="password" 
                            id="auth_password" 
                            className="auth_form_input"
                            name="password" 
                            placeholder="Enter your password" 
                            required
                        />
                        <span className="auth_input_icon">🔒</span>
                    </div>

                    <div className="auth_signup_fields">
                        <div className="auth_form_group">
                            <label className="auth_form_label" htmlFor="auth_confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                id="auth_confirmPassword" 
                                className="auth_form_input"
                                name="confirmPassword" 
                                placeholder="Confirm your password" 
                                required={currentMode === 'signup'}
                            />
                            <span className="auth_input_icon">🔒</span>
                        </div>
                    </div>

                    <div className="auth_login_only auth_forgot_password">
                        <a 
                            href="#" 
                            className="auth_forgot_password_link"
                            onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}
                        >
                            Forgot your password?
                        </a>
                    </div>

                    <button 
                        type="submit" 
                        className="auth_submit_btn" 
                        id="auth_submitBtn"
                    >
                        {currentMode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="auth_divider">
                    <span className="auth_divider_span">or continue with</span>
                </div>

                <div className="auth_social_login">
                    <button 
                        className="auth_social_btn" 
                        onClick={() => handleSocialLogin('google')} 
                        title="Continue with Google"
                    >
                        G
                    </button>
                    <button 
                        className="auth_social_btn" 
                        onClick={() => handleSocialLogin('github')} 
                        title="Continue with GitHub"
                    >
                        ⚡
                    </button>
                    <button 
                        className="auth_social_btn" 
                        onClick={() => handleSocialLogin('microsoft')} 
                        title="Continue with Microsoft"
                    >
                        Ⓜ
                    </button>
                </div>

                <div className="auth_signup_fields auth_terms">
                    By signing up, you agree to our <a className="auth_terms_link" href="#">Terms of Service</a> and <a className="auth_terms_link" href="#">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;