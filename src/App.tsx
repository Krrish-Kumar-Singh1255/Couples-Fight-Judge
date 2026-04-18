import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Scale, AlertCircle, Share2, RefreshCw, ChevronRight } from 'lucide-react'

type VerdictData = {
  boy_fault_percent: number;
  girl_fault_percent: number;
  evidence_points: string[];
  judge_remarks: string;
  primary_fault: 'boy' | 'girl' | 'equal';
  is_fallback?: boolean;
}

function App() {
  const [step, setStep] = useState(1)
  const [boyName, setBoyName] = useState('')
  const [boyStory, setBoyStory] = useState('')
  const [boyComplaint, setBoyComplaint] = useState('')
  const [girlName, setGirlName] = useState('')
  const [girlStory, setGirlStory] = useState('')
  const [girlComplaint, setGirlComplaint] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [verdict, setVerdict] = useState<VerdictData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingText, setLoadingText] = useState('Reviewing the evidence...')

  const loadingPhrases = [
    "Reviewing the evidence...",
    "Consulting relationship law...",
    "Checking who left the dishes...",
    "Verdict incoming..."
  ]

  useEffect(() => {
    if (isLoading) {
      let i = 0
      setLoadingText(loadingPhrases[0])
      const interval = setInterval(() => {
        i++
        setLoadingText(loadingPhrases[i % loadingPhrases.length])
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const submitToJudge = async () => {
    if (isLoading) return; // Prevent multiple requests
    
    // Normalize inputs for reliable caching (trim spaces)
    const normalizedData = {
      boyName: boyName.trim(),
      boyStory: boyStory.trim(),
      boyComplaint: boyComplaint.trim(),
      girlName: girlName.trim(),
      girlStory: girlStory.trim(),
      girlComplaint: girlComplaint.trim()
    };
    
    const currentInput = JSON.stringify(normalizedData);
    const cached = localStorage.getItem('last_verdict');
    const cachedInput = localStorage.getItem('last_input');
    
    // Only use cache if it's NOT a fallback result
    if (cached && cachedInput === currentInput) {
      const parsedCached = JSON.parse(cached);
      if (!parsedCached.is_fallback) {
        setVerdict(parsedCached);
        setStep(5);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setStep(4);

    try {
      const response = await fetch('https://couples-fight-judge-backend.onrender.com/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(normalizedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to reach the judge');
      }

      const parsedVerdict: VerdictData = await response.json();
      if (!parsedVerdict || typeof parsedVerdict !== 'object') {
        throw new Error('Invalid verdict received from the judge.');
      }
      
      // Save to client-side cache ONLY if it's a real AI verdict (not a fallback)
      if (!parsedVerdict.is_fallback) {
        localStorage.setItem('last_verdict', JSON.stringify(parsedVerdict));
        localStorage.setItem('last_input', currentInput);
      }
      
      // Delay verdict reveal for dramatic effect
      setTimeout(() => {
        setVerdict(parsedVerdict);
        setStep(5);
      }, 1500);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message);
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1)
    setBoyName('')
    setBoyStory('')
    setBoyComplaint('')
    setGirlName('')
    setGirlStory('')
    setGirlComplaint('')
    setVerdict(null)
    setError(null)
  }

  const logoutTrap = () => {
    alert("ALERT: Unauthorized access detected. System is resetting...")
    reset()
  }

  const decoyClick = () => {
    const funnyMessages = [
      "Nice try, but that's a decoy!",
      "The Judge is watching you click wrong buttons...",
      "Incorrect button. Relationship points deducted.",
      "That button is for couples who don't fight.",
      "Access Denied. Try the other one."
    ]
    alert(funnyMessages[Math.floor(Math.random() * funnyMessages.length)])
  }

  const copyVerdict = () => {
    if (!verdict) return
    const text = `COURT VERDICT: ${boyName} vs ${girlName}\nFault: ${girlName} ${verdict.girl_fault_percent}% | ${boyName} ${verdict.boy_fault_percent}%\n\nSentence: Regardless of fault, ${boyName} must apologize immediately.\n\nTry it at: [Your URL]`
    navigator.clipboard.writeText(text)
    alert('Verdict copied to clipboard!')
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${
      step === 3 ? 'bg-pink-950/40' : 
      step === 2 ? 'bg-blue-950/40' : 
      (step === 5 && verdict?.primary_fault === 'girl') ? 'bg-pink-950/40' :
      (step === 5 && verdict?.primary_fault === 'boy') ? 'bg-blue-950/40' :
      'bg-navy'
    }`}>
      <div className="max-w-2xl mx-auto px-4 py-12 min-h-screen flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="flex justify-center mb-4">
              <Scale className="w-20 h-20 text-gold" />
            </div>
            <h1 className="text-5xl font-serif font-bold text-gold">Couples Fight Judge</h1>
            <p className="text-2xl italic text-white/90">"Fair verdict. Unfair outcome."</p>
            <p className="text-gray-400">Tell us your fight. We'll decide who's wrong. (The sentence is already decided.)</p>
            
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="flex gap-4">
                <button 
                  onClick={decoyClick}
                  className="bg-gold text-navy font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform shadow-lg opacity-90"
                >
                  Settle This Fight
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="bg-gold text-navy font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform shadow-lg"
                >
                  Settle This Fight
                </button>
                <button 
                  onClick={decoyClick}
                  className="bg-gold text-navy font-bold py-4 px-8 rounded-full text-xl hover:scale-105 transition-transform shadow-lg opacity-90"
                >
                  Settle This Fight
                </button>
              </div>

              <button 
                onClick={logoutTrap}
                className="text-red-500/50 hover:text-red-500 text-sm font-bold border border-red-500/20 px-4 py-1 rounded mt-8 transition-colors"
              >
                DON'T CLICK THIS BUTTON
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-12 italic">Warning: verdict is always fair. Sentence is not.</p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="boy-side"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-blue-400">
              <Gavel />
              <h2 className="text-2xl font-serif">The Defendant's Side (Boy)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={boyName}
                  onChange={(e) => setBoyName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-navy border border-blue-900/50 p-3 rounded focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What happened? Tell your side of the fight.</label>
                <textarea 
                  rows={4}
                  value={boyStory}
                  onChange={(e) => setBoyStory(e.target.value)}
                  placeholder="Be honest..."
                  className="w-full bg-navy border border-blue-900/50 p-3 rounded focus:border-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What did she do that was wrong? (Optional)</label>
                <textarea 
                  rows={2}
                  value={boyComplaint}
                  onChange={(e) => setBoyComplaint(e.target.value)}
                  placeholder="Evidence against the plaintiff..."
                  className="w-full bg-navy border border-blue-900/50 p-3 rounded focus:border-blue-400 outline-none"
                />
              </div>
              <button 
                onClick={() => setStep(3)}
                disabled={!boyName || !boyStory}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="girl-side"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-pink-400">
              <Gavel />
              <h2 className="text-2xl font-serif">The Plaintiff's Side (Girl)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input 
                  type="text" 
                  autoFocus
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-navy border border-pink-900/50 p-3 rounded focus:border-pink-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What happened? Tell your side of the fight.</label>
                <textarea 
                  rows={4}
                  value={girlStory}
                  onChange={(e) => setGirlStory(e.target.value)}
                  placeholder="Tell the truth..."
                  className="w-full bg-navy border border-pink-900/50 p-3 rounded focus:border-pink-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What did he do that was wrong? (Optional)</label>
                <textarea 
                  rows={2}
                  value={girlComplaint}
                  onChange={(e) => setGirlComplaint(e.target.value)}
                  placeholder="Evidence against the defendant..."
                  className="w-full bg-navy border border-pink-900/50 p-3 rounded focus:border-pink-400 outline-none"
                />
              </div>
              <button 
                onClick={submitToJudge}
                disabled={!girlName || !girlStory}
                className="w-full bg-pink-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Submit to the Judge ⚖️
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-8"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Scale className="w-24 h-24 mx-auto text-gold" />
            </motion.div>
            <h2 className="text-2xl font-serif text-gold">Court is in session...</h2>
            <motion.p 
              key={loadingText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl"
            >
              {loadingText}
            </motion.p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="verdict"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-12"
          >
            {error ? (
              <div className="bg-red-900/20 border border-red-500 p-6 rounded text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-bold">The Judge is Busy</h2>
                <p className="text-gray-400">{error}</p>
                <button onClick={reset} className="bg-gray-700 py-2 px-6 rounded">Try Again</button>
              </div>
            ) : verdict && (
              <>
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-serif font-bold text-gold uppercase tracking-widest cursor-default">The Court Has Ruled</h1>
                  <p className="text-xl text-gray-400">{boyName} vs {girlName}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                    <span className="text-pink-400">{girlName} ({verdict.girl_fault_percent}%)</span>
                    <span className="text-blue-400">{boyName} ({verdict.boy_fault_percent}%)</span>
                  </div>
                  <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-1000" 
                      style={{ width: `${verdict.girl_fault_percent}%` }}
                    />
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${verdict.boy_fault_percent}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-gray-400">FAULT PERCENTAGE SPLIT</p>
                </div>

                <div className="space-y-4 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-gold font-bold uppercase text-sm tracking-widest">Evidence Findings</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {verdict.evidence_points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="italic text-lg text-center px-4">
                  "{verdict.judge_remarks}"
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="sentence-box space-y-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="text-gold font-bold uppercase text-center tracking-widest relative z-10">The Sentence</h3>
                  <p className="text-2xl text-center leading-relaxed font-serif font-bold relative z-10 text-white drop-shadow-md">
                    {verdict.primary_fault === 'girl' && (
                      <>{boyName}, even though {girlName} was primarily at fault, per Relationship Code §69.4, you are hereby ordered to apologize immediately, bring snacks, and never mention this again.</>
                    )}
                    {verdict.primary_fault === 'boy' && (
                      <>{boyName}, you were clearly wrong. The court orders you to apologize immediately. Go. Now.</>
                    )}
                    {verdict.primary_fault === 'equal' && (
                      <>Both parties share blame equally. {boyName} must still apologize first. This is the law.</>
                    )}
                  </p>
                </motion.div>

                <div className="flex gap-4">
                  <button 
                    onClick={copyVerdict}
                    className="flex-1 border border-gray-700 py-3 rounded flex items-center justify-center gap-2 hover:bg-gray-800"
                  >
                    <Share2 className="w-4 h-4" /> Share Verdict
                  </button>
                  <button 
                    onClick={reset}
                    className="flex-1 bg-gold text-navy font-bold py-3 rounded flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Fight Again
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 italic mt-8">
                  This verdict is legally binding in 0 countries.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  )
}

export default App
