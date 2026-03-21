import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Phone, MapPin, AlignLeft, Save, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Profile = () => {
  const currentUsername = localStorage.getItem('username') || '';
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    bio: '',
    profilePictureUrl: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const resp = await api.get('/user/profile');
      setUserData(resp.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const resp = await api.put('/user/profile', userData);
      setMessage({ type: 'success', text: resp.data });
      if (userData.username !== currentUsername) {
        localStorage.setItem('username', userData.username);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwdLoading(true);
    setPwdMessage({ type: '', text: '' });
    try {
      const resp = await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPwdMessage({ type: 'success', text: resp.data });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed.' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) return (
    <div className="p-5 text-center text-muted fw-bold">
      <div className="spinner-border text-primary mb-3" role="status"></div>
      <p className="small text-uppercase">Loading profile...</p>
    </div>
  );

  return (
    <div className="container-fluid py-4 d-flex flex-column gap-4 font-inter">
      {/* Profile Header Card */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden d-flex flex-md-row align-items-center gap-4 p-5 position-relative">
        <div className="position-absolute bg-primary rounded-circle" style={{ right: '-50px', top: '-50px', width: '300px', height: '300px', filter: 'blur(50px)', opacity: '0.1' }}></div>
        <div className="rounded-circle bg-primary bg-gradient d-flex align-items-center justify-content-center shadow-lg border border-5 border-white position-relative z-1 flex-shrink-0 overflow-hidden" style={{ width: '100px', height: '100px' }}>
          {userData.profilePictureUrl ? (
            <img src={userData.profilePictureUrl} alt="Profile" className="w-100 h-100 object-fit-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }} />
          ) : (
            <User size={40} className="text-white" />
          )}
        </div>
        <div className="position-relative z-1">
          <h2 className="h4 fw-bolder text-dark mb-1">{userData.firstName} {userData.lastName}</h2>
          <p className="text-muted small mb-3">@{userData.username}</p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge bg-light text-secondary border px-3 py-2 d-flex align-items-center gap-2">
              <Mail size={12} /> {userData.email}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 bg-white p-1 rounded-pill shadow-sm border align-self-start">
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn px-4 py-2 rounded-pill fw-bold small border-0 ${activeTab === 'profile' ? 'btn-primary text-white shadow' : 'btn-link text-muted text-decoration-none'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`btn px-4 py-2 rounded-pill fw-bold small border-0 ${activeTab === 'security' ? 'btn-primary text-white shadow' : 'btn-link text-muted text-decoration-none'}`}
        >
          Change Password
        </button>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdate} className="row g-4">
          <div className="col-md-6 d-flex flex-column gap-4">
            <h3 className="h6 fw-bolder text-dark text-uppercase d-flex align-items-center gap-2 mb-0">
              <User size={16} className="text-primary" /> Personal Info
            </h3>
            <div className="card shadow-sm border-0 rounded-4 p-4 d-flex flex-column gap-4">
              <div>
                <label className="form-label small fw-bold text-muted">Username</label>
                <input type="text" value={userData.username} onChange={e => setUserData({...userData, username: e.target.value})} className="form-control bg-light border-0 fw-bold" />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">First Name</label>
                  <input type="text" value={userData.firstName} onChange={e => setUserData({...userData, firstName: e.target.value})} className="form-control bg-light border-0 fw-bold" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Last Name</label>
                  <input type="text" value={userData.lastName} onChange={e => setUserData({...userData, lastName: e.target.value})} className="form-control bg-light border-0 fw-bold" />
                </div>
              </div>
              <div>
                <label className="form-label small fw-bold text-muted">Email Address</label>
                <input type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} className="form-control bg-light border-0 fw-bold" />
              </div>
            </div>
          </div>

          <div className="col-md-6 d-flex flex-column gap-4">
            <h3 className="h6 fw-bolder text-dark text-uppercase d-flex align-items-center gap-2 mb-0">
              <AlignLeft size={16} className="text-secondary" /> Additional Details
            </h3>
            <div className="card shadow-sm border-0 rounded-4 p-4 d-flex flex-column gap-4">
              <div>
                <label className="form-label small fw-bold text-muted">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-muted"><Phone size={14} /></span>
                  <input type="text" value={userData.phoneNumber} onChange={e => setUserData({...userData, phoneNumber: e.target.value})} className="form-control bg-light border-0 fw-bold" />
                </div>
              </div>
              <div>
                <label className="form-label small fw-bold text-muted">Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 text-muted"><MapPin size={14} /></span>
                  <input type="text" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} className="form-control bg-light border-0 fw-bold" />
                </div>
              </div>
              <div>
                <label className="form-label small fw-bold text-muted">Bio</label>
                <textarea rows={2} value={userData.bio} onChange={e => setUserData({...userData, bio: e.target.value})} className="form-control bg-light border-0 fw-bold" style={{ resize: 'none' }}></textarea>
              </div>
              <div>
                <label className="form-label small fw-bold text-muted">Profile Picture URL</label>
                <input type="text" value={userData.profilePictureUrl || ''} onChange={e => setUserData({...userData, profilePictureUrl: e.target.value})} placeholder="https://..." className="form-control bg-light border-0 fw-bold" />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between p-4 bg-dark rounded-4 shadow text-white">
              <div>
                {message.text && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`small fw-bold ${message.type === 'error' ? 'text-danger' : 'text-success'}`}>
                    {message.text}
                  </motion.div>
                )}
              </div>
              <button disabled={saving} className="btn btn-primary rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2 shadow">
                {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Change Password Tab ── */}
      {activeTab === 'security' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 rounded-4 p-4 d-flex flex-column gap-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="p-3 bg-secondary text-white rounded-3">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="h5 fw-bolder text-dark mb-0">Change Password</h4>
                  <p className="text-muted small fw-bold mb-0">Update your account password</p>
                </div>
              </div>

              {pwdMessage.text && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`alert py-2 small d-flex align-items-center gap-2 ${pwdMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`}
                >
                  {pwdMessage.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {pwdMessage.text}
                </motion.div>
              )}

              <form onSubmit={handlePasswordUpdate} className="d-flex flex-column gap-3">
                <div>
                  <label className="form-label small fw-bold text-muted">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="form-control bg-light border-0 p-3"
                    required
                  />
                </div>
                <div>
                  <label className="form-label small fw-bold text-muted">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showNewPwd ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="form-control bg-light border-0 p-3 pe-5"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(s => !s)}
                      className="btn text-secondary position-absolute top-50 end-0 translate-middle-y me-1 border-0 bg-transparent p-0"
                      style={{ height: 'auto' }}
                      tabIndex={-1}
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="form-label small fw-bold text-muted">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="form-control bg-light border-0 p-3"
                    required
                  />
                </div>
                <button disabled={pwdLoading} type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-sm rounded-3 mt-2">
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
