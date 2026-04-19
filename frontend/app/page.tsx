"use client";

import { useState } from 'react';

type EvaluationResponse = {
  score: number;
  feedback: string;
  improvementTips: string[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: EvaluationResponse;
};

type HistoryItem = {
  id: string;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  timestamp: Date;
};

const MOCK_QUESTIONS = [
  "Tell me about a time you overcame a significant challenge at work.",
  "Describe a situation where you disagreed with a team member and how you resolved it.",
  "What is your greatest professional achievement so far?",
  "How do you prioritize your tasks when you have multiple deadlines?",
  "Where do you see yourself in five years?"
];

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Interview Mode States
  const [isInterviewMode, setIsInterviewMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewState, setInterviewState] = useState<'question' | 'evaluation' | 'completed'>('question');

  const startInterviewMode = () => {
    setIsInterviewMode(true);
    setCurrentQuestionIndex(0);
    setQuestion(MOCK_QUESTIONS[0]);
    setAnswer('');
    setResponse(null);
    setError(null);
    setInterviewState('question');
  };

  const exitInterviewMode = () => {
    setIsInterviewMode(false);
    setQuestion('');
    setAnswer('');
    setResponse(null);
    setError(null);
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < MOCK_QUESTIONS.length) {
      setCurrentQuestionIndex(nextIndex);
      setQuestion(MOCK_QUESTIONS[nextIndex]);
      setAnswer('');
      setResponse(null);
      setError(null);
      setInterviewState('question');
    } else {
      setInterviewState('completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError('Please provide both a question and an answer.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8081/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!res.ok) {
        let errorMessage = `Failed to evaluate. Server responded with status ${res.status}`;

        try {
          const errorData = await res.json();

          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          }
        } catch (e) {
          // Ignore JSON parse error and use default message
        }

        throw new Error(errorMessage);
      }

      const data: ApiResponse = await res.json();
      if (data.success && data.data) {
        setResponse(data.data);

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          question,
          answer,
          score: data.data.score,
          feedback: data.data.feedback,
          timestamp: new Date(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);

        if (isInterviewMode) {
          setInterviewState('evaluation');
        }

      } else {
        throw new Error(data.message || 'Invalid response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 p-4 sm:p-8">

      {/* Header Controls */}
      <div className="max-w-3xl w-full flex justify-end mb-4 animate-fade-in-up">
        {!isInterviewMode ? (
          <button
            onClick={startInterviewMode}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Start Mock Interview
          </button>
        ) : (
          <button
            onClick={exitInterviewMode}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg shadow hover:bg-gray-300 transition-colors"
          >
            Exit Interview Mode
          </button>
        )}
      </div>

      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
          <h1 className="text-3xl font-bold mb-2">
            {isInterviewMode ? 'Mock Interview Mode' : 'AI Interview Preparation'}
          </h1>
          <p className="text-blue-100">
            {isInterviewMode
              ? 'Answer the following sequence of behavioral questions.'
              : 'Practice your interview answers and get real-time AI feedback.'}
          </p>

          {/* Progress Tracker for Interview Mode */}
          {isInterviewMode && interviewState !== 'completed' && (
            <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold border border-white/30">
              Question {currentQuestionIndex + 1} / {MOCK_QUESTIONS.length}
            </div>
          )}
        </div>

        <div className="p-8">

          {isInterviewMode && interviewState === 'completed' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                You have successfully completed the mock interview. You can review your answers in the history section below or exit interview mode to practice freely.
              </p>
              <button
                onClick={exitInterviewMode}
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Return to Free Practice
              </button>
            </div>
          ) : (
            <>
              {(!isInterviewMode || interviewState === 'question') && (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Question Input */}
                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Question
                    </label>
                    {isInterviewMode ? (
                      <div className="w-full px-4 py-4 rounded-lg bg-indigo-50 border border-indigo-100 text-lg font-medium text-indigo-900">
                        {question}
                      </div>
                    ) : (
                      <input
                        id="question"
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. Tell me about a time you overcame a challenge."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        disabled={loading}
                      />
                    )}
                  </div>

                  {/* Answer Textarea */}
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      id="answer"
                      rows={6}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your detailed answer here..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                      disabled={loading}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Evaluating...
                      </div>
                    ) : (
                      'Submit Answer'
                    )}
                  </button>
                </form>
              )}

              {/* Results Section */}
              {response && (!isInterviewMode || interviewState === 'evaluation') && (
                <div className={`${!isInterviewMode ? 'mt-10 pt-8 border-t border-gray-200' : ''} animate-fade-in-up`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Evaluation Results</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Score Card */}
                    <div className="bg-indigo-50 rounded-xl p-6 text-center border border-indigo-100 flex flex-col justify-center items-center md:col-span-1">
                      <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Score</span>
                      <div className="flex items-baseline">
                        <span className={`text-7xl font-extrabold ${response.score >= 8 ? 'text-green-500' : response.score >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {response.score}
                        </span>
                        <span className="text-2xl text-gray-500 ml-1 font-semibold">/10</span>
                      </div>
                    </div>

                    {/* Feedback Card */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Feedback</h3>
                      <p className="text-gray-600 leading-relaxed">{response.feedback}</p>
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Improvement Tips
                    </h3>
                    <ul className="space-y-3">
                      {response.improvementTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 text-sm font-bold mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Question Button in Interview Mode */}
                  {isInterviewMode && (
                    <button
                      onClick={nextQuestion}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all"
                    >
                      {currentQuestionIndex + 1 < MOCK_QUESTIONS.length ? 'Next Question' : 'Complete Interview'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* History Section - Hidden during active interview mode */}
      {!isInterviewMode && history.length > 0 && (
        <div className="max-w-3xl w-full mt-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2">Interview History</h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-1 flex-1 pr-4" title={item.question}>
                    {item.question}
                  </h3>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-base font-extrabold ${item.score >= 8 ? 'bg-green-100 text-green-700 border border-green-200' :
                      item.score >= 5 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                      Score: {item.score}/10
                    </span>
                    <span className="text-xs text-gray-400 mt-2">{item.timestamp.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2" title={item.feedback}>
                  {item.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
