import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TakeQuiz = ({ quiz, onQuizSubmit }) => {
  const [timeLeft, setTimeLeft] = useState(quiz.timer);  // Set the initial timer
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState(
    quiz.questions.map(() => '') // Initialize with empty answers for each question
  );

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0 || isQuizSubmitted) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          clearInterval(timerInterval);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval); // Cleanup on component unmount or re-render
  }, [timeLeft, isQuizSubmitted]);

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = selectedAnswer;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to submit the quiz.');
        return;
      }

      // Format the answers correctly for submission
      const submissionAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id, // Ensure question has _id
        answer: answers[index], // Corresponding answer selected by the user
      }));

      const response = await axios.post(
        `http://localhost:5000/api/v1/quizzes/${quiz._id}/submit`,
        { quizId: quiz._id, answers: submissionAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.score !== undefined) {
        const userScore = response.data.score;

        // Update score state and notify the user
        setScore(userScore);
        toast.success(`Quiz submitted successfully! Your score is ${userScore} points.`);
        
        // Mark the quiz as submitted
        setIsQuizSubmitted(true);
      
        // Call the parent component's callback (if needed) to update the user dashboard or refresh state
        onQuizSubmit(); 
        
      
      } else {
        toast.error('Failed to retrieve score.');
      }
    } catch (error) {
      toast.error('Failed to submit quiz.');
      console.error('Error submitting quiz:', error.response?.data || error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-full">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{quiz.title}</h2>
          <p className="mb-4">Time Remaining: {timeLeft} seconds</p>
          <form>
            {quiz.questions.map((question, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-medium mb-2">
                  {index + 1}. {question.questionText}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={optIndex}
                        checked={answers[index] === optIndex}
                        onChange={() => handleAnswerChange(index, optIndex)}
                        className="mr-2"
                        disabled={isQuizSubmitted || timeLeft <= 0} // Disable if quiz is submitted or time is up
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {isQuizSubmitted ? (
              <button
                disabled
                className="w-full py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
              >
                Quiz Submitted
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Submit Quiz
              </button>
            )}
          </form>

          {isQuizSubmitted && (
            <div className="mt-6 text-black">
              <h3 className="text-xl font-medium mb-2">Your Score: {score} Points</h3>
              <button
                onClick={onQuizSubmit}
                className="w-full py-2 bg-blue-600  rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
