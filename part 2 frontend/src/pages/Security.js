import React, { useState } from 'react';
import { Shield, Key, Lock, Fingerprint, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Security = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [showSessions, setShowSessions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const resp = await api.post('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: resp.data });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column gap-5 font-inter">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <h3 className="h4 fw-bolder text-dark text-uppercase">Security Center</h3>
          <p className="text-muted fw-bold small mt-1">Manage your account security and authentication settings.</p>
        </div>
        <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4">
          <Shield size={24} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100 d-flex flex-column gap-4">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="p-3 bg-secondary text-white rounded-3">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="h5 fw-bolder text-dark mb-0">Password Settings</h4>
                <p className="text-muted small fw-bold mb-0">Update your account password</p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="d-flex flex-column gap-3 flex-grow-1">
               {message.text && (
                  <div className={`alert text-white fw-bold small d-flex align-items-center gap-2 py-2 px-3 rounded-3 ${message.type === 'error' ? 'bg-danger' : 'bg-success'}`}>
                     {message.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                     {message.text}
                  </div>
               )}
               <div className="d-flex flex-column gap-3">
                 <input 
                   type="password" 
                   placeholder="Current Password" 
                   value={passwordData.currentPassword}
                   onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                   className="form-control bg-light border-0 p-3" 
                   required
                 />
                 <input 
                   type="password" 
                   placeholder="New Password (min 6 chars)" 
                   value={passwordData.newPassword}
                   onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                   className="form-control bg-light border-0 p-3" 
                   required
                 />
                 <input 
                   type="password" 
                   placeholder="Confirm New Password" 
                   value={passwordData.confirmPassword}
                   onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                   className="form-control bg-light border-0 p-3" 
                   required
                 />
               </div>
               <button disabled={loading} type="submit" className="btn btn-primary w-100 py-3 mt-auto fw-bold shadow-sm rounded-3">
                 {loading ? 'Processing...' : 'Sync New Password'}
               </button>
            </form>
          </div>
        </div>

        <div className="col-md-6 d-flex flex-column gap-4">
          {/* Active Sessions Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="h6 fw-bolder text-dark mb-0">Active Sessions</h4>
                  <p className="text-muted small fw-bold mb-0">Manage logged-in devices</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSessions(!showSessions)} 
                className="btn btn-outline-secondary btn-sm fw-bolder text-uppercase tracking-widest rounded-pill px-4"
              >
                {showSessions ? 'Hide' : 'View'}
              </button>
            </div>
            <AnimatePresence>
              {showSessions && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-light rounded-3 p-3 mt-3 d-flex flex-column gap-2"
                >
                  <div className="d-flex justify-content-between align-items-center small fw-bolder text-secondary text-uppercase">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-success rounded-circle" style={{width: '6px', height: '6px'}} ></div>
                      Current Device (Auckland, NZ)
                    </div>
                    <span className="text-muted">Active Now</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center small fw-bolder text-muted text-uppercase">
                    <div>Mobile Participant (Wellington, NZ)</div>
                    <button className="btn btn-link text-danger p-0 fw-bold underline">Revoke</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security Logs Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="h6 fw-bolder text-dark mb-0">Security Logs</h4>
                  <p className="text-muted small fw-bold mb-0">Recent account activity</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="btn btn-outline-secondary btn-sm fw-bolder text-uppercase tracking-widest rounded-pill px-4"
              >
                {showLogs ? 'Hide' : 'Review'}
              </button>
            </div>
            <AnimatePresence>
              {showLogs && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-light rounded-3 p-3 mt-3 d-flex flex-column gap-2"
                >
                  <div className="small fw-bolder text-muted d-flex justify-content-between text-uppercase">
                    <span>Account Synced</span>
                    <span>2 mins ago</span>
                  </div>
                  <div className="small fw-bolder text-muted d-flex justify-content-between text-uppercase">
                    <span>New Profile Committed</span>
                    <span>1 hour ago</span>
                  </div>
                  <div className="small fw-bolder text-muted d-flex justify-content-between text-uppercase">
                    <span>Registry Accessed</span>
                    <span>4 hours ago</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
