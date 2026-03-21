import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Pencil, Trash2, Trophy,
  Filter, User, Database, Heart, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// All 7 supported OpenTDB categories (mirrors the backend map)
const CATEGORIES = {
  9:  'General Knowledge',
  17: 'Science & Nature',
  23: 'History',
  22: 'Geography',
  11: 'Movies & Film',
  18: 'Computers & Technology',
  21: 'Sports',
};

const AdminDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    creator: '',
    category: '9',
    difficulty: 'medium',
    startDate: '',
    endDate: '',
    passingCriteria: 7
  });
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedTournamentName, setSelectedTournamentName] = useState('');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [scoreboardData, setScoreboardData] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, totalTournaments: 0, totalQuestionsAnswered: 0, totalLikesGiven: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchStatistics();
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/admin/tournaments');
      setTournaments(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const resp = await api.get('/admin/dashboard/statistics');
      setStats(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      categoryId: parseInt(formData.category),
      startDate: formData.startDate.includes('T') ? formData.startDate : `${formData.startDate}T00:00:00`,
      endDate: formData.endDate.includes('T') ? formData.endDate : `${formData.endDate}T23:59:59`,
      passingThreshold: (parseInt(formData.passingCriteria) / 10) * 100
    };

    try {
      if (editingId) {
        await api.put(`/admin/tournaments/${editingId}`, payload);
      } else {
        await api.post('/admin/tournaments', payload);
      }
      setShowModal(false);
      setEditingId(null);
      fetchTournaments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save tournament. Please try again.');
    }
  };

  const fetchQuestions = async (tournament) => {
    try {
      const resp = await api.get(`/admin/tournaments/${tournament.id}/questions`);
      setSelectedQuestions(resp.data);
      setSelectedTournamentName(tournament.name);
      setShowQuestions(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchScoreboard = async (tournamentId) => {
    try {
      const resp = await api.get(`/admin/tournaments/${tournamentId}/scoreboard`);
      setScoreboardData(resp.data);
      setShowScoreboard(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/tournaments/${id}`);
      setDeleteConfirmId(null);
      fetchTournaments();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (t) => {
    const threshold = t.passingThreshold != null ? Math.round((t.passingThreshold / 100) * 10) : 7;
    setFormData({
      name: t.name,
      creator: t.creator || '',
      category: t.category,
      difficulty: t.difficulty,
      startDate: t.startDate.split('T')[0],
      endDate: t.endDate.split('T')[0],
      passingCriteria: threshold
    });
    setEditingId(t.id);
    setShowModal(true);
    setFormError('');
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ name: '', creator: '', category: '9', difficulty: 'medium', startDate: '', endDate: '', passingCriteria: 7 });
    setShowModal(true);
    setFormError('');
  };

  return (
    <div className="container-fluid py-4 d-flex flex-column gap-5 font-inter">

      {/* Stats Header */}
      <div className="row g-3 px-2">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
              <Trophy size={18} />
            </div>
            <div>
              <div className="fw-bolder fs-5 text-dark mb-0">{stats.totalTournaments}</div>
              <div className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.6rem'}}>Tournaments</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3">
            <div className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
              <User size={18} />
            </div>
            <div>
              <div className="fw-bolder fs-5 text-dark mb-0">{stats.totalUsers}</div>
              <div className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.6rem'}}>Players</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3">
            <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
              <Database size={18} />
            </div>
            <div>
              <div className="fw-bolder fs-5 text-dark mb-0">{stats.totalQuestionsAnswered}</div>
              <div className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.6rem'}}>Questions Answered</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 d-flex flex-row align-items-center gap-3">
            <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px'}}>
              <Heart size={18} />
            </div>
            <div>
              <div className="fw-bolder fs-5 text-dark mb-0">{stats.totalLikesGiven}</div>
              <div className="small fw-bold text-muted text-uppercase" style={{fontSize: '0.6rem'}}>Likes Given</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center px-2">
        <h3 className="h5 fw-bolder text-dark mb-0">Tournament Management</h3>
        <button
          onClick={openCreate}
          className="btn btn-primary rounded-pill px-4 py-2 fw-bold text-uppercase text-white d-flex align-items-center gap-2 shadow-sm border-0"
          style={{fontSize: '0.75rem'}}
        >
          <Plus size={18} />
          New Tournament
        </button>
      </div>

      {/* Tournament Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
          <span className="small fw-bold text-muted text-uppercase">All Tournaments</span>
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><Search size={16} /></span>
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control border-start-0 fw-bold small"
              />
            </div>
            <button className="btn btn-outline-secondary"><Filter size={18} /></button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small fw-bold text-uppercase">
              <tr>
                <th className="px-4 py-3 border-bottom-0">ID</th>
                <th className="px-4 py-3 border-bottom-0">Tournament Name</th>
                <th className="px-4 py-3 border-bottom-0">Category</th>
                <th className="px-4 py-3 border-bottom-0">Difficulty</th>
                <th className="px-4 py-3 border-bottom-0">Pass Mark</th>
                <th className="px-4 py-3 border-bottom-0">Start Date</th>
                <th className="px-4 py-3 border-bottom-0">End Date</th>
                <th className="px-4 py-3 border-bottom-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="placeholder-glow">
                    <td colSpan={7} className="px-4 py-4"><span className="placeholder bg-secondary col-12 py-3 rounded"></span></td>
                  </tr>
                ))
              ) : (
                tournaments
                  .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 fw-bolder text-muted small">#{t.id.toString().padStart(4, '0')}</td>
                    <td className="px-4 py-3 fw-bolder text-dark">{t.name}</td>
                    <td className="px-4 py-3 small fw-bold text-secondary">
                      {CATEGORIES[parseInt(t.category)] || `Category ${t.category}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge rounded-pill border px-3 py-1 text-uppercase ${
                        t.difficulty === 'hard' ? 'bg-danger bg-opacity-10 text-danger border-danger' :
                        t.difficulty === 'medium' ? 'bg-warning bg-opacity-10 text-warning border-warning' : 'bg-success bg-opacity-10 text-success border-success'
                      }`}>
                        {t.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1 fw-bold">
                        {t.passingThreshold != null ? `${Math.round((t.passingThreshold / 100) * 10)}/10` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 small fw-bold text-muted">
                      {new Date(t.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 small fw-bold text-muted">
                      {new Date(t.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button onClick={() => fetchQuestions(t)} title="View Questions" className="btn btn-outline-secondary btn-sm rounded-3">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => fetchScoreboard(t.id)} title="View Scoreboard" className="btn btn-outline-success btn-sm rounded-3">
                          <Trophy size={16} />
                        </button>
                        <button onClick={() => openEdit(t)} title="Edit" className="btn btn-outline-primary btn-sm rounded-3">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirmId(t.id)} title="Delete" className="btn btn-outline-danger btn-sm rounded-3">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && tournaments.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <tr><td colSpan={8} className="text-center py-5 text-muted small fw-bold">No tournaments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="modal-content rounded-4 border-0 shadow-lg"
              >
                <div className="modal-body p-5">
                  <h3 className="h3 fw-bolder text-dark mb-1">
                    {editingId ? 'Edit Tournament Dates' : 'New Tournament'}
                  </h3>
                  <p className="text-muted small mb-4">
                    {editingId
                      ? 'You can only adjust the start and end dates. All other details are locked.'
                      : 'Fill in the details below to create a new tournament.'}
                  </p>

                  <form onSubmit={handleSubmit} className="row g-4">
                    {formError && (
                      <div className="col-12">
                        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="alert alert-danger py-2 small">
                          {formError}
                        </motion.div>
                      </div>
                    )}

                    {/* ── EDIT MODE: show locked info + date pickers only ── */}
                    {editingId ? (
                      <>
                        {/* Read-only summary of the locked fields */}
                        <div className="col-12">
                          <div className="bg-light rounded-4 p-4 d-flex flex-wrap gap-4">
                            <div>
                              <div className="small text-muted fw-bold text-uppercase mb-1">Tournament Name</div>
                              <div className="fw-bolder text-dark">{formData.name}</div>
                            </div>
                            <div>
                              <div className="small text-muted fw-bold text-uppercase mb-1">Category</div>
                              <div className="fw-bolder text-dark">{CATEGORIES[parseInt(formData.category)] || formData.category}</div>
                            </div>
                            <div>
                              <div className="small text-muted fw-bold text-uppercase mb-1">Difficulty</div>
                              <div className="fw-bolder text-dark text-capitalize">{formData.difficulty}</div>
                            </div>
                            <div>
                              <div className="small text-muted fw-bold text-uppercase mb-1">Pass Mark</div>
                              <div className="fw-bolder text-primary">{formData.passingCriteria}/10</div>
                            </div>
                          </div>
                          <div className="small text-muted mt-2 d-flex align-items-center gap-1">
                            <span>🔒</span> These details cannot be changed after creation.
                          </div>
                        </div>

                        {/* Only date pickers */}
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Start Date *</label>
                          <input
                            type="date"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">End Date *</label>
                          <input
                            type="date"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      /* ── CREATE MODE: full form ── */
                      <>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Tournament Name *</label>
                          <input
                            type="text"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            placeholder="e.g. Science Championship 2026"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Creator Name</label>
                          <input
                            type="text"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            placeholder="e.g. Admin"
                            value={formData.creator}
                            onChange={(e) => setFormData({...formData, creator: e.target.value})}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Category *</label>
                          <select
                            className="form-select bg-light border-0 py-3 fw-bold"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                          >
                            {Object.entries(CATEGORIES).map(([id, name]) => (
                              <option key={id} value={id}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Difficulty *</label>
                          <select
                            className="form-select bg-light border-0 py-3 fw-bold"
                            value={formData.difficulty}
                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Minimum Passing Score (out of 10) *</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            className="form-control bg-light border-0 py-3 fw-bold"
                            placeholder="e.g. 7"
                            value={formData.passingCriteria}
                            onChange={(e) => setFormData({...formData, passingCriteria: parseInt(e.target.value) || ''})}
                            required
                          />
                          <div className="form-text small text-muted">Enter a number between 1 and 10</div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">Start Date *</label>
                          <input
                            type="date"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">End Date *</label>
                          <input
                            type="date"
                            className="form-control bg-light border-0 py-3 fw-bold"
                            value={formData.endDate}
                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="col-12 mt-4 d-flex justify-content-end gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="btn btn-light rounded-pill px-4 fw-bold text-muted">Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold text-white shadow">
                        {editingId ? 'Update Dates' : 'Create Tournament'}
                      </button>
                    </div>
                  </form>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="modal-content rounded-4 border-0 shadow-lg"
              >
                <div className="modal-body p-5 text-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{width: '64px', height: '64px'}}>
                    <Trash2 className="text-danger" size={28} />
                  </div>
                  <h4 className="fw-bolder text-dark mb-2">Delete Tournament?</h4>
                  <p className="text-muted small mb-4">This action cannot be undone. All associated data will be permanently removed.</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button onClick={() => setDeleteConfirmId(null)} className="btn btn-light rounded-pill px-4 fw-bold">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-danger rounded-pill px-4 fw-bold text-white">Yes, Delete</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Scoreboard Modal */}
      <AnimatePresence>
        {showScoreboard && scoreboardData && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100}}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="modal-content rounded-4 border-0 shadow-lg overflow-hidden"
              >
                <div className="modal-header border-bottom p-5 pb-4 align-items-end">
                  <div>
                    <h3 className="h3 fw-bolder text-dark mb-1">Scoreboard</h3>
                    <p className="text-primary fw-bolder text-uppercase small mb-0" style={{fontSize: '0.65rem'}}>{scoreboardData.tournamentName}</p>
                  </div>
                  <div className="d-flex gap-5 ms-auto">
                    <div className="text-center">
                      <div className="small fw-bolder text-uppercase text-muted mb-1" style={{fontSize: '0.65rem'}}>Participants</div>
                      <div className="h4 fw-bolder text-dark mb-0">{scoreboardData.totalPlayersParticipated}</div>
                    </div>
                    <div className="text-center">
                      <div className="small fw-bolder text-uppercase text-muted mb-1" style={{fontSize: '0.65rem'}}>Avg. Score</div>
                      <div className="h4 fw-bolder text-dark mb-0">{scoreboardData.averageScore}</div>
                    </div>
                    <div className="text-center">
                      <div className="small fw-bolder text-uppercase text-muted mb-1" style={{fontSize: '0.65rem'}}>Likes</div>
                      <div className="h4 fw-bolder text-primary mb-0">{scoreboardData.numberOfLikes}</div>
                    </div>
                  </div>
                </div>

                <div className="modal-body p-5 pt-4" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                  <table className="table table-hover align-middle border-light">
                    <thead className="text-muted small fw-bolder text-uppercase" style={{fontSize: '0.65rem'}}>
                      <tr>
                        <th className="pb-3 border-bottom-0">Rank</th>
                        <th className="pb-3 border-bottom-0">Player</th>
                        <th className="pb-3 border-bottom-0">Completed</th>
                        <th className="pb-3 border-bottom-0 text-end">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoreboardData.scores.map((s, idx) => (
                        <tr key={idx}>
                          <td className="py-3 fw-bolder text-muted small">#{idx + 1}</td>
                          <td className="py-3 fw-bolder text-dark">{s.playerName}</td>
                          <td className="py-3 small fw-bold text-muted">{new Date(s.completedDate).toLocaleString()}</td>
                          <td className="py-3 text-end">
                            <span className={`fw-bolder ${s.score >= 7 ? 'text-primary' : 'text-dark'}`}>{s.score}/10</span>
                          </td>
                        </tr>
                      ))}
                      {scoreboardData.scores.length === 0 && (
                        <tr><td colSpan={4} className="py-5 text-center small fw-bold text-muted">No scores recorded yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="modal-footer border-top bg-light p-4">
                  <button onClick={() => setShowScoreboard(false)} className="btn btn-dark rounded-pill px-5 py-2 fw-bold text-white">Close</button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* View Questions Modal */}
      <AnimatePresence>
        {showQuestions && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100}}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="modal-content rounded-4 border-0 shadow-lg"
              >
                <div className="modal-header border-bottom p-5 pb-4">
                  <div>
                    <h3 className="h3 fw-bolder text-dark mb-1">Question Set</h3>
                    <p className="text-primary fw-bolder small mb-0" style={{fontSize: '0.65rem'}}>{selectedTournamentName}</p>
                  </div>
                </div>

                <div className="modal-body p-5 pt-4 d-flex flex-column gap-4" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                  {selectedQuestions.map((q, idx) => (
                    <div key={q.id}>
                      <div className="d-flex gap-3 mb-3">
                        <div className="bg-light rounded d-flex align-items-center justify-content-center fw-bolder text-muted flex-shrink-0" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>{idx + 1}</div>
                        <div className="h6 fw-bolder text-dark lh-sm">{q.questionText}</div>
                      </div>
                      <div className="row g-2 ps-5">
                        <div className="col-md-6">
                          <div className="bg-success bg-opacity-10 border border-success rounded-3 p-3 fw-bold small text-success d-flex align-items-center gap-2">
                            <div className="bg-success rounded-circle" style={{width: '8px', height: '8px'}}></div>
                            {q.correctAnswer}
                          </div>
                        </div>
                        {q.incorrectAnswers.map((ans, i) => (
                          <div className="col-md-6" key={i}>
                            <div className="bg-light border rounded-3 p-3 fw-bold small text-muted d-flex align-items-center gap-2">
                              <div className="bg-secondary rounded-circle" style={{width: '8px', height: '8px'}}></div>
                              {ans}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-footer border-top bg-light p-4">
                  <button onClick={() => setShowQuestions(false)} className="btn btn-dark rounded-pill px-5 py-2 fw-bold text-white">Close</button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
