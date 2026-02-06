import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, Download, Settings, Eye, Users, Edit2, Smile, Image } from 'lucide-react';

const SprintRetro = () => {
  const defaultQuestions = [
    {
      category: "What went well?",
      prompt: "What aspects of the sprint were successful? What should we continue doing?",
      icon: "✓",
      allowEmojis: true,
      allowGifs: true,
      required: false
    },
    {
      category: "What didn't go well?",
      prompt: "What challenges did we face? What obstacles slowed us down?",
      icon: "⚠",
      allowEmojis: true,
      allowGifs: true,
      required: false
    },
    {
      category: "What can we improve?",
      prompt: "What specific changes could make our next sprint better?",
      icon: "↑",
      allowEmojis: true,
      allowGifs: true,
      required: false
    },
    {
      category: "Action items",
      prompt: "What concrete steps will we take based on today's discussion?",
      icon: "→",
      allowEmojis: true,
      allowGifs: false,
      required: true
    }
  ];

  const [mode, setMode] = useState('user'); // 'user', 'admin', 'customize'
  const [questions, setQuestions] = useState(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [showSummary, setShowSummary] = useState(false);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [editingQuestions, setEditingQuestions] = useState([...defaultQuestions]);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const ADMIN_PASSCODE = '1028';

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionsResult, submissionsResult] = await Promise.all([
        window.storage.get('retro-questions', true),
        window.storage.list('retro-submission:', true)
      ]);

      if (questionsResult?.value) {
        const savedQuestions = JSON.parse(questionsResult.value);
        setQuestions(savedQuestions);
        setEditingQuestions(savedQuestions);
        setAnswers(Array(savedQuestions.length).fill(''));
        setAnswerGifs(Array(savedQuestions.length).fill([]));
      } else {
        // If no saved questions, set and save the defaults
        setQuestions(defaultQuestions);
        setEditingQuestions(defaultQuestions);
        await window.storage.set('retro-questions', JSON.stringify(defaultQuestions), true);
      }

      if (submissionsResult?.keys) {
        const submissions = await Promise.all(
          submissionsResult.keys.map(async (key) => {
            const result = await window.storage.get(key, true);
            return result ? JSON.parse(result.value) : null;
          })
        );
        setAllSubmissions(submissions.filter(Boolean));
      }
    } catch (error) {
      console.log('No saved data found, using defaults');
      // Set defaults if there's an error
      setQuestions(defaultQuestions);
      setEditingQuestions(defaultQuestions);
    }
  };

  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [selectedGif, setSelectedGif] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [answerGifs, setAnswerGifs] = useState(Array(defaultQuestions.length).fill([]));

  const workFriendlyEmojis = [
    '👍', '👎', '🎉', '💡', '🚀', '⭐', '✅', '❌', '🔥', '💪',
    '🎯', '📈', '📉', '⚠️', '🤔', '😊', '😕', '💯', '🏆', '🙌',
    '👏', '🤝', '💼', '📊', '⏰', '🎨', '🔧', '🛠️', '📝', '✨',
    '🌟', '💬', '📢', '🔔', '⚡', '🎪', '🏃', '🧩', '🎲', '🌈'
  ];

  const workFriendlyGifs = [
    { 
      id: 1, 
      url: 'https://media.tenor.com/0ENdiDOszLAAAAAC/thumbs-up.gif',
      thumbnail: '👍',
      keywords: 'success thumbs up' 
    },
    { 
      id: 2, 
      url: 'https://media.tenor.com/HKLaaj0BjmMAAAAC/party.gif',
      thumbnail: '🎉',
      keywords: 'celebrate party happy' 
    },
    { 
      id: 3, 
      url: 'https://media.tenor.com/JKDDaVQ_hz0AAAAC/high-five.gif',
      thumbnail: '🙌',
      keywords: 'high five teamwork' 
    },
    { 
      id: 4, 
      url: 'https://media.tenor.com/NOYP3MzEUZAAAAAC/thinking.gif',
      thumbnail: '🤔',
      keywords: 'thinking confused question' 
    },
    { 
      id: 5, 
      url: 'https://media.tenor.com/WL0q6qD1ye0AAAAC/rocket.gif',
      thumbnail: '🚀',
      keywords: 'rocket launch growth' 
    },
    { 
      id: 6, 
      url: 'https://media.tenor.com/EcIfzm4JOUUAAAAC/facepalm.gif',
      thumbnail: '🤦',
      keywords: 'facepalm frustrated mistake' 
    },
    { 
      id: 7, 
      url: 'https://media.tenor.com/TKWlNDjP7rkAAAAC/approve.gif',
      thumbnail: '✅',
      keywords: 'approve yes good' 
    },
    { 
      id: 8, 
      url: 'https://media.tenor.com/YZ-JWYWQYn0AAAAC/mind-blown.gif',
      thumbnail: '🤯',
      keywords: 'mind blown amazing wow' 
    },
    { 
      id: 9, 
      url: 'https://media.tenor.com/X-iosqDwehkAAAAC/dancing.gif',
      thumbnail: '💃',
      keywords: 'dancing happy celebration' 
    },
    { 
      id: 10, 
      url: 'https://media.tenor.com/YREaGwIaNu0AAAAC/typing.gif',
      thumbnail: '⌨️',
      keywords: 'working hard typing' 
    },
    { 
      id: 11, 
      url: 'https://media.tenor.com/N4NwCKh6gmYAAAAC/clapping.gif',
      thumbnail: '👏',
      keywords: 'clapping applause great' 
    },
    { 
      id: 12, 
      url: 'https://media.tenor.com/qVq5tOX0eeMAAAAC/stress.gif',
      thumbnail: '😰',
      keywords: 'stress panic worried' 
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const insertEmoji = (emoji) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = (newAnswers[currentQuestion] || '') + emoji;
    setAnswers(newAnswers);
    setShowEmojiPicker(false);
  };

  const insertGif = (gifUrl) => {
    const newAnswerGifs = [...answerGifs];
    if (!newAnswerGifs[currentQuestion]) {
      newAnswerGifs[currentQuestion] = [];
    }
    newAnswerGifs[currentQuestion] = [...newAnswerGifs[currentQuestion], gifUrl];
    setAnswerGifs(newAnswerGifs);
    setShowGifPicker(false);
  };

  const removeGif = (gifUrl) => {
    const newAnswerGifs = [...answerGifs];
    newAnswerGifs[currentQuestion] = newAnswerGifs[currentQuestion].filter(url => url !== gifUrl);
    setAnswerGifs(newAnswerGifs);
  };

  const renderAnswerWithGifs = (text, gifs) => {
    return (
      <div className="space-y-3">
        {text && <p className="text-gray-700 whitespace-pre-wrap">{text}</p>}
        {gifs && gifs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {gifs.map((gifUrl, idx) => {
              const gifData = workFriendlyGifs.find(g => g.url === gifUrl);
              return (
                <div key={idx} className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center relative">
                  <span className="text-5xl absolute z-10">{gifData?.thumbnail || '🎬'}</span>
                  <img 
                    src={gifUrl} 
                    alt={`Response GIF ${idx + 1}`}
                    className="w-full h-full object-cover absolute top-0 left-0"
                    onLoad={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onError={(e) => {
                      console.error('Failed to load GIF:', gifUrl);
                      e.target.style.display = 'none';
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const searchGifs = () => {
    if (!gifSearchTerm.trim()) {
      setGifs(workFriendlyGifs);
      return;
    }
    const filtered = workFriendlyGifs.filter(gif => 
      gif.keywords.toLowerCase().includes(gifSearchTerm.toLowerCase())
    );
    setGifs(filtered.length > 0 ? filtered : workFriendlyGifs);
  };

  useEffect(() => {
    searchGifs();
  }, [gifSearchTerm]);

  const nextQuestion = () => {
    // Check if current question is required and has no answer
    if (questions[currentQuestion].required && 
        !answers[currentQuestion]?.trim() && 
        (!answerGifs[currentQuestion] || answerGifs[currentQuestion].length === 0)) {
      alert('This question is required. Please provide an answer before continuing.');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleAdminAccess = () => {
    if (passcodeInput === ADMIN_PASSCODE) {
      setIsAdminAuthenticated(true);
      setMode('admin');
      setPasscodeInput('');
      setShowPasscodeModal(false);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscodeInput('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setMode('user');
    setAiSummary('');
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitRetro = async () => {
    const submission = {
      id: `retro-submission:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      answers: answers,
      gifs: answerGifs,
      questions: questions
    };

    try {
      await window.storage.set(submission.id, JSON.stringify(submission), true);
      setAllSubmissions([...allSubmissions, submission]);
      alert('Your retrospective has been submitted anonymously!');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  const reset = () => {
    setCurrentQuestion(0);
    setAnswers(Array(questions.length).fill(''));
    setAnswerGifs(Array(questions.length).fill([]));
    setShowSummary(false);
  };

  const exportResults = () => {
    let text = '=== SPRINT RETROSPECTIVE ===\n\n';
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    questions.forEach((q, idx) => {
      text += `${q.category}\n`;
      text += `${'-'.repeat(q.category.length)}\n`;
      text += `${answers[idx] || '(No response)'}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint-retro-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const exportAllSubmissions = () => {
    let text = '=== ALL SPRINT RETROSPECTIVE SUBMISSIONS ===\n\n';
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Total Submissions: ${allSubmissions.length}\n\n`;
    
    allSubmissions.forEach((sub, subIdx) => {
      text += `\n${'='.repeat(60)}\n`;
      text += `SUBMISSION #${subIdx + 1}\n`;
      text += `Submitted: ${new Date(sub.timestamp).toLocaleString()}\n`;
      text += `${'='.repeat(60)}\n\n`;
      
      sub.questions.forEach((q, idx) => {
        text += `${q.category}\n`;
        text += `${'-'.repeat(q.category.length)}\n`;
        text += `${sub.answers[idx] || '(No response)'}\n\n`;
      });
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-retros-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const saveCustomQuestions = async () => {
    try {
      await window.storage.set('retro-questions', JSON.stringify(editingQuestions), true);
      setQuestions(editingQuestions);
      setAnswers(Array(editingQuestions.length).fill(''));
      setMode('user');
      alert('Questions saved successfully!');
    } catch (error) {
      console.error('Failed to save questions:', error);
      alert('Failed to save questions. Please try again.');
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...editingQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditingQuestions(updated);
  };

  const addQuestion = () => {
    setEditingQuestions([...editingQuestions, { 
      category: '', 
      prompt: '', 
      icon: '•',
      allowEmojis: true,
      allowGifs: true,
      required: false
    }]);
  };

  const removeQuestion = (index) => {
    if (editingQuestions.length > 1) {
      setEditingQuestions(editingQuestions.filter((_, i) => i !== index));
    }
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all submissions? This cannot be undone.')) {
      try {
        const result = await window.storage.list('retro-submission:', true);
        if (result?.keys) {
          await Promise.all(result.keys.map(key => window.storage.delete(key, true)));
        }
        setAllSubmissions([]);
        setAiSummary('');
        alert('All submissions cleared!');
      } catch (error) {
        console.error('Failed to clear data:', error);
      }
    }
  };

  const generateAISummary = async () => {
    if (allSubmissions.length === 0) {
      alert('No submissions to summarize. Please wait for team members to submit their retrospectives.');
      return;
    }

    setIsGeneratingSummary(true);
    setAiSummary('');

    try {
      // Prepare the data for AI analysis
      let promptText = `You are analyzing a sprint retrospective with ${allSubmissions.length} anonymous team member submissions. 

Please provide a comprehensive summary that includes:
1. Common themes and patterns across all responses
2. Key insights for each retrospective question
3. Top priority action items based on team feedback
4. Overall team sentiment and morale indicators

Here are the submissions:

`;

      allSubmissions.forEach((sub, idx) => {
        promptText += `\n--- Submission ${idx + 1} ---\n`;
        sub.questions.forEach((q, qIdx) => {
          promptText += `\n${q.category}:\n`;
          promptText += `${sub.answers[qIdx] || '(No response)'}\n`;
        });
      });

      promptText += `\n\nProvide a well-structured summary that helps the team understand collective feedback and identify actionable next steps.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            { 
              role: "user", 
              content: promptText
            }
          ],
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        setAiSummary(data.content[0].text);
      } else {
        setAiSummary('Unable to generate summary. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      setAiSummary('Error generating summary. Please check your connection and try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // CUSTOMIZE MODE
  if (mode === 'customize' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Customize Questions</h1>
            <button
              onClick={() => setMode('user')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-6">
            {editingQuestions.map((q, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Question {idx + 1}</h3>
                  {editingQuestions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                    <input
                      type="text"
                      value={q.icon}
                      onChange={(e) => updateQuestion(idx, 'icon', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      maxLength={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={q.category}
                      onChange={(e) => updateQuestion(idx, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., What went well?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                      value={q.prompt}
                      onChange={(e) => updateQuestion(idx, 'prompt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                      rows={2}
                      placeholder="Detailed question or guidance for the team"
                    />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.allowEmojis !== false}
                        onChange={(e) => updateQuestion(idx, 'allowEmojis', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Smile size={16} />
                        Allow Emojis
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.allowGifs !== false}
                        onChange={(e) => updateQuestion(idx, 'allowGifs', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Image size={16} />
                        Allow GIFs
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required === true}
                        onChange={(e) => updateQuestion(idx, 'required', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Required
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition"
          >
            + Add Question
          </button>

          <div className="flex gap-4 mt-8">
            <button
              onClick={saveCustomQuestions}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Save Questions
            </button>
            <button
              onClick={() => {
                setEditingQuestions(defaultQuestions);
                saveCustomQuestions();
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN MODE
  if (mode === 'admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('customize')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Edit2 size={18} />
                Customize Questions
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{allSubmissions.length}</div>
              <div className="text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{questions.length}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {allSubmissions.length > 0 ? new Date(allSubmissions[allSubmissions.length - 1].timestamp).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-gray-600">Last Submission</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={generateAISummary}
              disabled={isGeneratingSummary || allSubmissions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGeneratingSummary ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Summary...
                </>
              ) : (
                <>
                  <span className="text-xl">🤖</span>
                  Generate AI Summary
                </>
              )}
            </button>
            <button
              onClick={exportAllSubmissions}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Export All
            </button>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Clear All Data
            </button>
          </div>

          {aiSummary && (
            <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
                  <span className="text-3xl">🤖</span>
                  AI-Generated Summary
                </h2>
                <button
                  onClick={() => setAiSummary('')}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Submissions (Anonymous)</h2>
          
          {allSubmissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No submissions yet. Responses will appear here once team members submit their retrospectives.
            </div>
          ) : (
            <div className="space-y-6">
              {allSubmissions.map((sub, subIdx) => (
                <div key={subIdx} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Submission #{subIdx + 1}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(sub.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {sub.questions.map((q, qIdx) => (
                      <div key={qIdx} className="border-l-4 border-indigo-400 pl-4">
                        <h4 className="font-semibold text-indigo-600 mb-1 flex items-center gap-2">
                          <span>{q.icon}</span>
                          {q.category}
                        </h4>
                        {renderAnswerWithGifs(sub.answers[qIdx], sub.gifs?.[qIdx])}
                        {!sub.answers[qIdx] && (!sub.gifs?.[qIdx] || sub.gifs[qIdx].length === 0) && (
                          <em className="text-gray-400">(No response)</em>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // USER MODE - SUMMARY VIEW
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Amazing Work!
              </h1>
              <p className="text-gray-600">Here's your retrospective summary</p>
            </div>
            
            {questions.map((q, idx) => (
              <div key={idx} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                <h2 className="text-xl font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                  <span className="text-3xl">{q.icon}</span>
                  {q.category}
                </h2>
                {renderAnswerWithGifs(answers[idx], answerGifs[idx])}
                {!answers[idx] && (!answerGifs[idx] || answerGifs[idx].length === 0) && (
                  <em className="text-gray-400">(No response)</em>
                )}
              </div>
            ))}

            <div className="flex gap-4 mt-8 flex-wrap">
              <button
                onClick={submitRetro}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Users size={20} />
                Submit Anonymously
              </button>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Download size={20} />
                Export
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <RotateCcw size={20} />
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER MODE - QUESTION VIEW
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Passcode Modal */}
        {showPasscodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-scale">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye size={24} className="text-green-600" />
                Admin Access
              </h2>
              <p className="text-gray-600 mb-6">Enter the admin passcode to access the admin panel.</p>
              
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(false);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminAccess();
                  }
                }}
                placeholder="Enter passcode"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 mb-4 text-lg text-center tracking-widest ${
                  passcodeError 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                    : 'border-purple-300 focus:border-purple-500 focus:ring-purple-200'
                }`}
                autoFocus
              />
              
              {passcodeError && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                  <span>❌</span>
                  Incorrect passcode. Please try again.
                </p>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleAdminAccess}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg font-semibold"
                >
                  Enter
                </button>
                <button
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscodeInput('');
                    setPasscodeError(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowPasscodeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl hover:from-green-500 hover:to-emerald-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                title="Admin Panel"
              >
                <Eye size={18} />
                Admin
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sprint Retrospective ✨
              </h1>
              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
              <span className="text-5xl animate-bounce">{questions[currentQuestion].icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  {questions[currentQuestion].category}
                  {questions[currentQuestion].required && (
                    <span className="text-red-500 ml-2">*</span>
                  )}
                </h2>
              </div>
            </div>
            <p className="text-gray-700 text-lg mb-6 pl-4 border-l-4 border-purple-400">
              {questions[currentQuestion].prompt}
              {questions[currentQuestion].required && (
                <span className="text-red-500 text-sm ml-2 font-semibold">(Required)</span>
              )}
            </p>

            <textarea
              value={answers[currentQuestion]}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Share your thoughts here... ✍️"
              className="w-full h-48 p-4 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 resize-none text-gray-700 shadow-inner transition-all"
            />

            {answerGifs[currentQuestion] && answerGifs[currentQuestion].length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                <h3 className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  Your GIFs:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {answerGifs[currentQuestion].map((gifUrl, idx) => {
                    const gifData = workFriendlyGifs.find(g => g.url === gifUrl);
                    return (
                      <div key={idx} className="relative group">
                        <div className="w-32 h-32 border-2 border-purple-300 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                          <span className="text-5xl absolute z-10">{gifData?.thumbnail || '🎬'}</span>
                          <img 
                            src={gifUrl} 
                            alt={`Selected GIF ${idx + 1}`}
                            className="w-full h-full object-cover absolute top-0 left-0 transform group-hover:scale-105 transition-transform"
                            onLoad={(e) => {
                              e.target.style.opacity = '1';
                            }}
                            onError={(e) => {
                              console.error('Failed to load GIF:', gifUrl);
                              e.target.style.display = 'none';
                            }}
                            style={{ opacity: 0, transition: 'opacity 0.3s' }}
                          />
                        </div>
                        <button
                          onClick={() => removeGif(gifUrl)}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {questions[currentQuestion].allowEmojis !== false && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl hover:from-yellow-500 hover:to-orange-500 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    <Smile size={18} />
                    Add Emoji
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute top-14 left-0 bg-white border-2 border-purple-300 rounded-2xl shadow-2xl p-4 z-10 w-80">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-purple-600 flex items-center gap-2">
                          <span className="text-xl">😊</span>
                          Pick an Emoji
                        </h3>
                        <button
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                        {workFriendlyEmojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => insertEmoji(emoji)}
                            className="text-2xl p-2 hover:bg-purple-100 rounded-lg transition transform hover:scale-110"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {questions[currentQuestion].allowGifs !== false && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                      setGifs(workFriendlyGifs);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-xl hover:from-pink-500 hover:to-rose-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                  >
                    <Image size={18} />
                    Add GIF
                  </button>
                  
                  {showGifPicker && (
                    <div className="absolute top-14 left-0 bg-white border-2 border-pink-300 rounded-2xl shadow-2xl p-4 z-10 w-96">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-pink-600 flex items-center gap-2">
                          <span className="text-xl">🎬</span>
                          Pick a GIF
                        </h3>
                        <button
                          onClick={() => setShowGifPicker(false)}
                          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Search: success, celebrate, thinking..."
                        value={gifSearchTerm}
                        onChange={(e) => setGifSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl mb-3 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                      />
                      
                      <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {gifs.map((gif) => (
                          <button
                            key={gif.id}
                            onClick={() => insertGif(gif.url)}
                            className="border-2 border-pink-200 rounded-xl overflow-hidden hover:border-pink-400 transition transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-br from-pink-50 to-purple-50"
                          >
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center relative">
                              <span className="text-6xl absolute z-10">{gif.thumbnail}</span>
                              <img 
                                src={gif.url} 
                                alt={`GIF: ${gif.keywords}`}
                                className="w-full h-full object-cover absolute top-0 left-0"
                                loading="lazy"
                                onLoad={(e) => {
                                  e.target.style.opacity = '1';
                                }}
                                onError={(e) => {
                                  console.error('Failed to load GIF in picker:', gif.url);
                                  e.target.style.display = 'none';
                                }}
                                style={{ opacity: 0, transition: 'opacity 0.3s' }}
                              />
                            </div>
                            <div className="p-2 bg-white text-xs text-gray-600 text-center">
                              {gif.keywords.split(' ')[0]}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {gifs.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          No GIFs found. Try a different search term.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-xl hover:from-gray-400 hover:to-gray-500 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:from-gray-300 disabled:hover:to-gray-400 transform hover:-translate-y-0.5 disabled:transform-none font-semibold"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={reset}
              className="px-4 py-2 text-purple-600 hover:text-purple-800 transition font-semibold"
            >
              Reset
            </button>

            <button
              onClick={nextQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              {currentQuestion === questions.length - 1 ? '🎉 Finish' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintRetro;