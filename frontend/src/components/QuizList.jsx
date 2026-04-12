import React from 'react';

const QuizList = ({ quizzes, onTakeQuiz, currentUserId }) => {
  return (
    <div className="p-2 text-black">
      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes available at the moment.</p>
      ) : (
        <div className='flex flex-wrap gap-4'>
          {quizzes.map((quiz) => {
            // 1. Check if user ID is in the attemptedUsers array
            const isAttempted = quiz.attemptedUsers?.some(
              (id) => id.toString() === currentUserId?.toString()
            );

            // 2. Check if deadline has passed
            const isExpired = quiz.deadline ? new Date() > new Date(quiz.deadline) : false;

            return (
              <div key={quiz._id} className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 w-72 transition-hover hover:shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
                <p className="text-[11px] text-gray-400 mb-3">
                   Deadline: {new Date(quiz.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span>⏱ {quiz.timer}s</span>
                    <span>💎 {quiz.totalPoints} pts</span>
                </div>
                
                {/* PRIORITY LOGIC */}
                {isAttempted ? (
                  <button 
                    disabled 
                    className="w-full bg-green-50 text-green-600 border border-green-100 py-2 rounded-xl cursor-not-allowed font-bold"
                  >
                    ✓ Submitted
                  </button>
                ) : isExpired ? (
                  <button 
                    disabled 
                    className="w-full bg-red-50 text-red-500 border border-red-100 py-2 rounded-xl cursor-not-allowed font-medium"
                  >
                    Expired
                  </button>
                ) : (
                  <button
                    onClick={() => onTakeQuiz(quiz)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-xl hover:opacity-90 transition font-bold shadow-sm shadow-purple-100"
                  >
                    Take Quiz
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizList;