import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

// Returns a 0–4 strength score
const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Strong', 'Very strong'];
const strengthColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pwdStrength = formData.password ? getPasswordStrength(formData.password) : -1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'Required';
    if (!formData.lastName.trim()) errors.lastName = 'Required';
    if (!formData.username.trim()) errors.username = 'Username is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData; // strip confirm field
      await api.post('/auth/signup/player', payload);
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-0 bg-white" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <div className="row g-0 min-vh-100">
        {/* Left branding panel */}
        <div className="col-lg-5 d-none d-lg-flex bg-dark text-white p-5 flex-column justify-content-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-uppercase fw-bold text-muted">Master the Quiz, Conquer the Tournament.</span>
            <h1 className="display-3 fw-bolder mt-3 mb-5">Push Your<br />Limits</h1>
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

        {/* Right sign-up form */}
        <motion.div 
          className="col-lg-7 d-flex flex-column justify-content-center p-4 p-md-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="w-100 mx-auto" style={{ maxWidth: '480px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle bg-primary" style={{ width: '28px', height: '28px' }}></div>
                <span className="fs-6 fw-bold">QuizTournament</span>
              </div>
              <Link to="/login" className="text-primary text-decoration-none fw-bold small d-flex align-items-center gap-1">
                Sign In <ArrowRight size={14} />
              </Link>
            </div>

            <h2 className="h3 fw-bolder mb-1">Create your account</h2>
            <p className="text-muted small mb-4">Join thousands of players competing in quiz tournaments.</p>

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

            <form onSubmit={handleSignup} className="row g-3" noValidate>

              {/* Name row */}
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">First Name *</label>
                <input
                  name="firstName"
                  className={`form-control ${fieldErrors.firstName ? 'is-invalid' : ''}`}
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {fieldErrors.firstName && <div className="invalid-feedback">{fieldErrors.firstName}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">Last Name *</label>
                <input
                  name="lastName"
                  className={`form-control ${fieldErrors.lastName ? 'is-invalid' : ''}`}
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {fieldErrors.lastName && <div className="invalid-feedback">{fieldErrors.lastName}</div>}
              </div>

              {/* Username */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Username *</label>
                <input
                  name="username"
                  className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
                {fieldErrors.username && <div className="invalid-feedback">{fieldErrors.username}</div>}
              </div>

              {/* Email */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
              </div>

              {/* Password */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Password *</label>
                <div className="position-relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control pe-5 ${fieldErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="btn text-secondary position-absolute top-50 end-0 translate-middle-y me-1 border-0 bg-transparent p-0"
                    style={{ height: 'auto' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}

                {/* Strength bar */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="d-flex gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div
                          key={i}
                          className={`rounded flex-fill ${i < pwdStrength ? strengthColors[pwdStrength] : 'bg-light border'}`}
                          style={{ height: '4px', transition: 'background 0.3s' }}
                        />
                      ))}
                    </div>
                    <span className="small text-muted">{strengthLabels[Math.max(0, pwdStrength)]}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Confirm Password *</label>
                <div className="position-relative">
                  <input
                    name="confirmPassword"
                    type="password"
                    className={`form-control pe-5 ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {formData.confirmPassword && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                      {formData.confirmPassword === formData.password
                        ? <CheckCircle2 size={18} className="text-success" />
                        : <XCircle size={18} className="text-danger" />
                      }
                    </div>
                  )}
                </div>
                {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
              </div>

              {/* Optional bio */}
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">Bio (optional)</label>
                <textarea
                  name="bio"
                  className="form-control"
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  style={{ height: '60px', resize: 'none' }}
                />
              </div>

              <div className="col-12 mt-2">
                <button
                  type="submit"
                  id="signup-submit"
                  className="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account...</>
                  ) : (
                    <><UserPlus size={18} /> Create Account</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
