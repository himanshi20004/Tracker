
import React from 'react';

const QuizList = ({ quizzes, onTakeQuiz }) => {
  return (
    <div className="p-6 text-black">
    
      {quizzes.length === 0 ? (
        <p>No quizzes available at the moment.</p>
      ) : (
        <div className='flex flex-row gap-3'>
          {quizzes.map((quiz) => (

            <div key={quiz._id} className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-medium mb-2">{quiz.title}</h3>
              <p className="mb-2">Time: {quiz.timer} seconds</p>
              <p className="mb-4">Total Points: {quiz.totalPoints}</p>
              <button
                onClick={() => onTakeQuiz(quiz)}
                className="bg-purple-600 text-white p-2 rounded font-serif m-2"
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
