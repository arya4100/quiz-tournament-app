import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, CheckCircle2, XCircle, Clock, 
  ArrowRight, Sparkles, Zap, ShieldCheck,
  Target, Award, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const QuizSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  // Detailed tracking for post-quiz summary
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [answeredWrong, setAnsweredWrong] = useState([]);
  const [skipped, setSkipped] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const resp = await api.get(`/player/tournaments/${id}/questions`);
      setQuestions(resp.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedOption) return;
    
    try {
      const q = questions[currentIndex];
      const resp = await api.post(`/player/tournaments/${id}/questions/${q.id}/answer`, {
        answer: selectedOption
      });
      
       const correct = resp.data.correct;
       setIsCorrect(correct);
       setFeedback(resp.data.feedback);
       setCorrectAnswer(resp.data.correctAnswer);
       setIsAnswered(true);
       if (correct) {
         setScore(prev => prev + 1);
         setAnsweredCorrectly(prev => [...prev, { question: q.questionText, yourAnswer: selectedOption }]);
       } else {
         setAnsweredWrong(prev => [...prev, { question: q.questionText, yourAnswer: selectedOption, correctAnswer: resp.data.correctAnswer }]);
       }
    } catch (err) {
      console.error(err);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
       // If not answered, count as skipped
       if (!isAnswered) {
         setSkipped(prev => [...prev, { question: questions[currentIndex].questionText }]);
       }
       setCurrentIndex(currentIndex + 1);
       setSelectedOption(null);
       setIsAnswered(false);
       setIsCorrect(null);
       setFeedback('');
       setCorrectAnswer('');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setLoading(true);
    try {
      const resp = await api.post(`/player/tournaments/${id}/complete?score=${score}`);
      setResult(resp.data);
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !completed) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary mb-4" role="status" style={{width: '4rem', height: '4rem'}}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="h4 fw-bolder text-dark text-uppercase tracking-widest">Calibrating Arena...</h3>
      </div>
    );
  }

  if (completed && result) {
    const totalQ = result.totalQuestions;
    const correctCount = answeredCorrectly.length;
    const wrongCount = answeredWrong.length;
    const skippedCount = skipped.length;
    const pct = ((result.score / totalQ) * 100).toFixed(0);

    return (
      <div className="container py-5" style={{ maxWidth: '860px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-4 shadow-lg border border-light overflow-hidden"
        >
          {/* Colour bar */}
          <div className={`p-5 text-white position-relative overflow-hidden ${result.earnedCertification ? 'bg-success' : 'bg-secondary'}`}>
            <div className="position-absolute top-0 end-0 opacity-25" style={{transform: 'translate(30%, -30%)'}}><Trophy size={180} /></div>
            <div className="position-relative z-1">
              <p className="text-white-50 small fw-bold text-uppercase mb-1">Quiz Complete</p>
              <h2 className="display-5 fw-bolder mb-0">{result.earnedCertification ? '🎉 Well done!' : 'Good effort!'}</h2>
            </div>
          </div>

          <div className="p-5">
            {/* Score cards */}
            <div className="row g-3 mb-5">
              <div className="col-6 col-md-3">
                <div className="card border-0 bg-light rounded-4 p-4 text-center h-100">
                  <div className="display-6 fw-bolder text-dark">{result.score}/{totalQ}</div>
                  <div className="small fw-bold text-muted text-uppercase mt-1">Score</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 bg-success bg-opacity-10 rounded-4 p-4 text-center h-100">
                  <div className="display-6 fw-bolder text-success">{correctCount}</div>
                  <div className="small fw-bold text-success text-uppercase mt-1">Correct</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 bg-danger bg-opacity-10 rounded-4 p-4 text-center h-100">
                  <div className="display-6 fw-bolder text-danger">{wrongCount}</div>
                  <div className="small fw-bold text-danger text-uppercase mt-1">Wrong</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 bg-warning bg-opacity-10 rounded-4 p-4 text-center h-100">
                  <div className="display-6 fw-bolder text-warning">{skippedCount}</div>
                  <div className="small fw-bold text-warning text-uppercase mt-1">Skipped</div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="d-flex justify-content-between small fw-bold text-muted mb-2">
                <span>Accuracy</span><span>{pct}%</span>
              </div>
              <div className="progress rounded-pill" style={{height: '10px'}}>
                <div
                  className={`progress-bar rounded-pill ${parseInt(pct) >= 60 ? 'bg-success' : 'bg-danger'}`}
                  style={{width: `${pct}%`, transition: 'width 1s ease-out'}}
                />
              </div>
            </div>

            {/* Question breakdown */}
            {(answeredWrong.length > 0 || skipped.length > 0) && (
              <div className="mb-5">
                <h4 className="h6 fw-bolder text-dark text-uppercase mb-3">Review</h4>
                <div className="d-flex flex-column gap-3">
                  {answeredWrong.map((item, i) => (
                    <div key={i} className="bg-danger bg-opacity-10 rounded-4 p-3 border border-danger border-opacity-25">
                      <div className="small fw-bolder text-dark mb-1">{item.question}</div>
                      <div className="small text-danger">Your answer: <strong>{item.yourAnswer}</strong></div>
                      <div className="small text-success">Correct: <strong>{item.correctAnswer}</strong></div>
                    </div>
                  ))}
                  {skipped.map((item, i) => (
                    <div key={i} className="bg-warning bg-opacity-10 rounded-4 p-3 border border-warning border-opacity-25">
                      <div className="small fw-bolder text-dark mb-1">{item.question}</div>
                      <div className="small text-warning">Skipped</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.earnedCertification && (
              <div className="bg-success bg-opacity-10 border border-success rounded-4 p-4 text-center mb-5">
                <Award className="text-success mx-auto mb-2" size={36} />
                <h4 className="fw-bolder text-success mb-1">Certification Earned!</h4>
                <p className="small text-success mb-0">You passed with {pct}% — congratulations!</p>
              </div>
            )}

            <button
              onClick={() => navigate('/player')}
              className="btn btn-secondary w-100 py-3 rounded-pill fw-bolder text-white shadow"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="container py-4 font-inter" style={{ maxWidth: '900px' }}>
      {/* Session Progress Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
         <div className="text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 small text-uppercase fw-bolder tracking-widest text-muted mb-2">
               <Zap className="text-primary" size={14} />
               Session in Progress
            </div>
            <h1 className="h2 fw-bolder text-dark">Intellectual Sprint</h1>
         </div>

         <div className="d-flex align-items-center gap-4">
            <div className="text-end">
               <div className="small fw-bolder text-uppercase tracking-widest text-muted">Progress Tracker</div>
               <div className="h4 fw-bolder text-dark mb-0">
                  {currentIndex + 1} <span className="text-muted">/</span> {questions.length}
               </div>
            </div>
            <div className="rounded-circle border border-4 border-light d-flex align-items-center justify-content-center position-relative" style={{width: '64px', height: '64px'}}>
               <div className="small fw-bolder text-primary">T-{currentIndex + 1}</div>
               <svg className="position-absolute w-100 h-100" style={{ transform: 'rotate(-90deg)', top: 0, left: 0 }}>
                  <circle 
                    cx="32" cy="32" r="30" 
                    fill="none" 
                    stroke="var(--bs-primary)" 
                    strokeWidth="4" 
                    strokeDasharray="188.4" 
                    strokeDashoffset={188.4 - (188.4 * (currentIndex + 1)) / questions.length}
                    style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
                  />
               </svg>
            </div>
         </div>
      </div>

      {/* Cinematic Question Card */}
      <motion.div 
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4 p-4 p-md-5 shadow-lg border border-white position-relative overflow-hidden mb-5"
      >
        <div className="position-absolute top-0 end-0 p-4 text-light opacity-50 user-select-none" style={{ zIndex: 0 }}>
           <Trophy size={100} />
        </div>

        <div className="position-relative z-1">
           <div className="d-flex align-items-center gap-2 mb-4">
              <span className="badge bg-dark rounded-pill py-2 px-3 fw-bolder text-uppercase tracking-widest shadow-sm">Phase 0{currentIndex + 1}</span>
              <div className="bg-light" style={{height: '1px', width: '40px'}}></div>
           </div>

           <h3 className="h2 fw-bolder text-dark mb-5" style={{ lineHeight: '1.2' }}>
              {currentQ.questionText}
           </h3>

           <div className="row g-3">
              {currentQ.options.map((opt, i) => {
                 let btnClass = "btn btn-outline-light text-start text-dark border p-3 rounded-4 d-flex align-items-center gap-3 w-100 shadow-sm";
                 let bgClass = "bg-light text-muted border";
                 let textClass = "fw-bold";

                 if (selectedOption === opt) {
                    btnClass = "btn btn-outline-danger text-start text-dark border-danger p-3 rounded-4 d-flex align-items-center gap-3 w-100 shadow";
                    bgClass = "bg-danger text-white border-0";
                    textClass = "fw-bolder text-dark";
                 }
                 if (isAnswered && opt === selectedOption) {
                    if (isCorrect) {
                       btnClass = "btn btn-success text-start text-dark bg-success bg-opacity-10 border-success p-3 rounded-4 d-flex align-items-center gap-3 w-100 shadow";
                    } else {
                       btnClass = "btn btn-danger text-start text-dark bg-danger bg-opacity-10 border-danger p-3 rounded-4 d-flex align-items-center gap-3 w-100 shadow";
                    }
                 }

                 return (
                 <div className="col-md-6" key={i}>
                   <button
                     disabled={isAnswered}
                     onClick={() => setSelectedOption(opt)}
                     className={btnClass}
                     style={{ transition: 'all 0.2s ease-in-out' }}
                   >
                     <div className={`rounded flex-shrink-0 d-flex align-items-center justify-content-center fw-bolder ${bgClass}`} style={{ width: '40px', height: '40px' }}>
                        {String.fromCharCode(65 + i)}
                     </div>
                     <span className={textClass}>{opt}</span>
                     
                     {isAnswered && opt === selectedOption && (
                        <div className="ms-auto">
                           {isCorrect ? <CheckCircle2 className="text-success" size={24} /> : <XCircle className="text-danger" size={24} />}
                        </div>
                     )}
                   </button>
                 </div>
              )})}
            </div>

            <AnimatePresence>
               {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mt-4 p-4 rounded-4 border ${isCorrect ? 'bg-success bg-opacity-10 border-success text-success' : 'bg-danger bg-opacity-10 border-danger text-danger'}`}
                  >
                     <div className="d-flex align-items-center gap-3 mb-2 fw-bolder text-uppercase tracking-widest small">
                        {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        {isCorrect ? 'Validation Successful' : 'Anomaly Detected'}
                     </div>
                     <p className="mb-0 fw-bold">{feedback}</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </motion.div>

      {/* Tactical Control Bar */}
      <div className="d-flex justify-content-end px-3">
         <AnimatePresence>
            {!isAnswered && selectedOption && (
               <motion.button
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 onClick={handleAnswer}
                 className="btn btn-danger rounded-pill px-5 py-3 fw-bolder text-uppercase tracking-widest text-xs d-flex align-items-center gap-2 shadow"
               >
                  Commit Choice <Target size={20} />
               </motion.button>
            )}

            {isAnswered && (
               <motion.button
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 onClick={nextQuestion}
                 className="btn btn-secondary rounded-pill px-5 py-3 fw-bolder text-uppercase tracking-widest text-xs d-flex align-items-center gap-2 shadow"
               >
                  {currentIndex === questions.length - 1 ? 'Finalize Certification' : 'Advance Phase'} 
                  <ArrowRight size={20} />
               </motion.button>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizSession;
