import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Heart, ArrowRight, Gem, Globe,
  LayoutGrid, List, Star, Clock, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

// All 7 OpenTDB categories  (matches backend map)
const CATEGORIES = {
  9:  'General Knowledge',
  17: 'Science & Nature',
  23: 'History',
  22: 'Geography',
  11: 'Movies & Film',
  18: 'Computers & Technology',
  21: 'Sports',
};

const TABS = ['ongoing', 'upcoming', 'past', 'participated', 'results', 'leaderboard'];

const PlayerDashboard = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    } else {
      fetchTournaments();
    }
  }, [activeTab]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      // 'results' tab reuses the 'participated' status but shows score data
      const status = activeTab === 'results' ? 'participated' : activeTab;
      const resp = await api.get(`/player/tournaments?status=${status}`);
      setTournaments(resp.data);
    } catch (err) {
      console.error('Failed to fetch tournaments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/player/tournaments/leaderboard');
      setLeaderboard(resp.data);
    } catch (err) {
      console.error('Leaderboard fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id, currentlyLiked) => {
    try {
      if (currentlyLiked) {
        await api.delete(`/player/tournaments/${id}/like`);
      } else {
        await api.post(`/player/tournaments/${id}/like`);
      }
      fetchTournaments();
    } catch (err) {
      console.error('Like action failed', err);
    }
  };

  const tabLabel = (t) => {
    if (t === 'past') return 'Past';
    if (t === 'participated') return 'Participated';
    if (t === 'results') return 'Results';
    if (t === 'leaderboard') return 'Leaderboard';
    return t.charAt(0).toUpperCase() + t.slice(1);
  };

  return (
    <div className="d-flex flex-column gap-4 font-inter">
      {/* Tab Bar */}
      <div className="d-flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn rounded-pill px-4 py-2 small fw-bold text-capitalize ${
              activeTab === tab
                ? 'btn-secondary text-white shadow'
                : 'btn-outline-secondary bg-white text-muted border'
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* ── Leaderboard Tab ── */}
      {activeTab === 'leaderboard' && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
            <div className="p-2 bg-warning text-dark rounded"><Star size={18} /></div>
            <h3 className="h5 fw-bolder text-dark mb-0">Global Leaderboard</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3 border-bottom-0">Rank</th>
                  <th className="px-4 py-3 border-bottom-0">Player</th>
                  <th className="px-4 py-3 border-bottom-0">Tournaments Played</th>
                  <th className="px-4 py-3 border-bottom-0 text-end">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="placeholder-glow">
                      <td colSpan={4} className="px-4 py-4"><span className="placeholder bg-secondary col-12 py-3 rounded"></span></td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-5 text-muted small fw-bold">No leaderboard data yet.</td></tr>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <div className={`rounded-circle d-inline-flex align-items-center justify-content-center fw-bolder small ${idx === 0 ? 'bg-warning text-dark' : idx === 1 ? 'bg-secondary text-white' : idx === 2 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light text-muted'}`} style={{width: '32px', height: '32px'}}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 fw-bolder text-dark">{entry.playerName}</td>
                      <td className="px-4 py-3 small fw-bold text-muted">{entry.tournamentsPlayed} events</td>
                      <td className="px-4 py-3 text-end fw-bolder text-primary">{entry.totalScore}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Results Tab ── */}
      {activeTab === 'results' && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
            <div className="p-2 bg-primary text-white rounded"><CheckCircle2 size={18} /></div>
            <h3 className="h5 fw-bolder text-dark mb-0">My Results</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3 border-bottom-0">Tournament</th>
                  <th className="px-4 py-3 border-bottom-0">Category</th>
                  <th className="px-4 py-3 border-bottom-0">Difficulty</th>
                  <th className="px-4 py-3 border-bottom-0 text-end">Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="placeholder-glow">
                      <td colSpan={4} className="px-4 py-4"><span className="placeholder bg-secondary col-12 py-3 rounded"></span></td>
                    </tr>
                  ))
                ) : tournaments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-5 text-muted small fw-bold">No results yet. Complete a tournament to see your scores here.</td></tr>
                ) : (
                  tournaments.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 fw-bolder text-dark">{t.name}</td>
                      <td className="px-4 py-3 small fw-bold text-muted">
                        {CATEGORIES[parseInt(t.category)] || `Category ${t.category}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill border px-3 py-1 text-capitalize ${
                          t.difficulty === 'hard' ? 'bg-danger bg-opacity-10 text-danger border-danger' :
                          t.difficulty === 'medium' ? 'bg-warning bg-opacity-10 text-warning border-warning' : 'bg-success bg-opacity-10 text-success border-success'
                        }`}>{t.difficulty}</span>
                      </td>
                      <td className="px-4 py-3 text-end">
                        {t.userScore !== undefined ? (
                          <span className={`fw-bolder ${t.userScore >= 7 ? 'text-primary' : 'text-dark'}`}>
                            {t.userScore}/10
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tournament Grid (Ongoing / Upcoming / Past / Participated) ── */}
      {!['leaderboard', 'results'].includes(activeTab) && (
        <>
          <div className="d-flex align-items-center justify-content-between">
            <h3 className="h5 fw-bold text-dark text-capitalize mb-0">
              {activeTab === 'past' ? 'Past' : activeTab} Tournaments
            </h3>
            <div className="d-flex gap-2">
              <button className="btn btn-light border text-primary"><LayoutGrid size={18} /></button>
              <button className="btn btn-light border text-muted"><List size={18} /></button>
            </div>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="col-md-6 col-lg-4">
                  <div className="bg-white rounded p-5 placeholder-glow border shadow-sm" style={{ height: '200px' }}>
                    <span className="placeholder col-12 h-100"></span>
                  </div>
                </div>
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border">
              <Clock size={48} className="mx-auto text-muted mb-3" />
              <h3 className="h5 fw-bold text-secondary">No {activeTab} tournaments</h3>
              <p className="text-muted small mt-2">Check back later for updates.</p>
            </div>
          ) : (
            <div className="row g-4">
              {tournaments.map((t) => (
                <div key={t.id} className="col-md-6 col-lg-4">
                  <motion.div
                    layout
                    className="card h-100 shadow-sm border-0 rounded-4 p-4 bg-white"
                    style={{ cursor: activeTab === 'ongoing' ? 'pointer' : 'default', transition: 'transform 0.2s' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => activeTab === 'ongoing' && navigate(`/quiz/${t.id}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`p-2 rounded-circle ${t.difficulty === 'easy' ? 'bg-success text-white' : t.difficulty === 'medium' ? 'bg-warning text-dark' : 'bg-danger text-white'}`}>
                        <Gem size={18} />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLike(t.id, t.isLiked || false); }}
                        className={`btn btn-sm rounded-circle ${t.isLiked ? 'btn-danger text-white' : 'btn-light text-muted'}`}
                      >
                        <Heart size={18} fill={t.isLiked ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <h4 className="card-title fw-bolder mb-2 small">{t.name}</h4>
                    <div className="d-flex flex-wrap gap-2 small fw-bold text-muted mb-3">
                      <span className="d-flex align-items-center gap-1"><Globe size={12} /> {CATEGORIES[parseInt(t.category)] || 'General'}</span>
                      <span>Ends: {new Date(t.endDate).toLocaleDateString()}</span>
                    </div>

                    {t.userScore !== undefined && (
                      <div className="badge bg-secondary text-white rounded-pill px-3 py-2 mb-3">
                        Score: {t.userScore}/10
                      </div>
                    )}

                    {activeTab === 'ongoing' && (
                      <div className="mt-auto pt-2 d-flex justify-content-end">
                        <span className="small fw-bolder text-primary d-flex align-items-center gap-1">
                          Start Quiz <ArrowRight size={14} />
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlayerDashboard;
