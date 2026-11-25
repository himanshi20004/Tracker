import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const TakeQuiz = ({ quiz, onQuizSubmit, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState(quiz.timer);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [totalUserPoints, setTotalUserPoints] = useState(null);
  const [answers, setAnswers] = useState(() => quiz.questions.map(() => null));

  const answersRef = useRef(answers);
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setIsSubmitting(true);

    try {
      const submissionAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id,
        answer: answersRef.current[index],
      }));

      const response = await api.post(`/quizzes/${quiz._id}/submit`, {
        quizId: quiz._id,
        answers: submissionAnswers,
      });

      if (response.data && response.data.score !== undefined) {
        const userScore = response.data.score;
        setScore(userScore);
        setTotalUserPoints(response.data.totalUserPoints);
        setIsQuizSubmitted(true);
        toast.success(`Quiz submitted! You scored ${userScore} points.`);
      } else {
        submittedRef.current = false;
        toast.error('Failed to retrieve score.');
      }
    } catch (error) {
      submittedRef.current = false;
      toast.error(error.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz]);

  useEffect(() => {
    if (isQuizSubmitted) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isQuizSubmitted, handleSubmit]);

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = selectedAnswer;
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
              <p className={`text-sm font-semibold mt-1 ${timeLeft <= 10 ? 'text-red-600' : 'text-purple-600'}`}>
                Time Remaining: {timeLeft}s
              </p>
            </div>
            {!isQuizSubmitted && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Exit
              </button>
            )}
          </div>

          {!isQuizSubmitted ? (
            <form>
              {quiz.questions.map((question, index) => (
                <div key={question._id || index} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-base font-semibold mb-3">
                    {index + 1}. {question.questionText}
                    <span className="ml-2 text-xs text-purple-600 font-medium">({question.points} pts)</span>
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer text-sm">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={optIndex}
                          checked={answers[index] === optIndex}
                          onChange={() => handleAnswerChange(index, optIndex)}
                          disabled={isSubmitting || timeLeft <= 0}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </form>
          ) : (
            <div className="py-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                Score: {score} / {quiz.totalPoints} Points
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Your submission has been recorded.
              </p>
              <button
                type="button"
                onClick={() => onQuizSubmit(totalUserPoints)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl hover:opacity-90 transition"
              >
                Back to Quizzes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
