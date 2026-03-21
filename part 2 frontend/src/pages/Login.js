import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username or email is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', role);

      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/player');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 bg-white" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="row g-0 h-100">
        {/* Left branding panel */}
        <div className="col-lg-6 d-none d-lg-flex bg-dark text-white p-5 flex-column justify-content-center position-relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-1"
          >
            <span className="text-uppercase fw-bold text-muted letter-spacing-2">Master the Quiz, Conquer the Tournament.</span>
            <h1 className="display-2 fw-bolder mt-3 mb-5">Push Your<br />Limits</h1>
            <div className="mt-4 text-center">
              <img 
                src="/hero.png" 
                alt="Quiz Tournament Hero" 
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Right sign-in form */}
        <motion.div 
          className="col-lg-6 d-flex flex-column justify-content-center p-5 p-md-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-100 mx-auto" style={{ maxWidth: '380px' }}>
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-primary" style={{ width: '28px', height: '28px' }}></div>
                <span className="fs-6 fw-bold">QuizTournament</span>
              </div>
              <Link to="/signup" className="text-primary text-decoration-none fw-bold small d-flex align-items-center gap-1">
                Sign Up <ArrowRight size={14} />
              </Link>
            </div>

            <h2 className="h3 fw-bolder mb-1">Welcome back</h2>
            <p className="text-muted small mb-4">Sign in to access your tournaments.</p>

            {/* Global error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3"
                role="alert"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="d-flex flex-column gap-3" noValidate>
              {/* Username field */}
              <div>
                <input
                  id="login-username"
                  type="text"
                  className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                  placeholder="Username or email"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldErrors(f => ({...f, username: ''})); }}
                  autoComplete="username"
                />
                {fieldErrors.username && (
                  <div className="invalid-feedback">{fieldErrors.username}</div>
                )}
              </div>

              {/* Password field */}
              <div>
                <div className="position-relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control pe-5 ${fieldErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({...f, password: ''})); }}
                    autoComplete="current-password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn text-secondary position-absolute top-50 end-0 translate-middle-y me-1 border-0 bg-transparent p-0"
                    style={{ height: 'auto' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="text-danger small mt-1">{fieldErrors.password}</div>
                )}
              </div>

              <button 
                type="submit" 
                id="login-submit"
                className="btn btn-primary w-100 py-2 mt-2 d-flex justify-content-center align-items-center gap-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...</>
                ) : (
                  <><LogIn size={18} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
