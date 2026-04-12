import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CreateQuizForm = () => {
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState('');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }
  ]);

  const navigate = useNavigate(); // Initialize the navigate function

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isInvalid = questions.some(q => 
      !q.questionText || q.options.some(opt => opt.trim() === "")
    );

    if (!title || !timer || !deadline || isInvalid) {
      toast.error('Please fill in all fields, including all options and the deadline.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'http://localhost:5000/api/v1/postquizzes',
        { 
          title, 
          questions, 
          timer: parseInt(timer, 10),
          deadline 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Quiz created successfully!');

      // AUTOMATIC NAVIGATION:
      // We wait 1.5 seconds so the user sees the success toast before leaving
      setTimeout(() => {
        navigate('/adminDashboard'); // Adjust this path to match your actual dashboard route
      }, 1500);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to create quiz.');
    }
  };

  return (
    <div className="quiz-form p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto mt-10 text-black">
      <h2 className="text-2xl font-semibold text-center mb-6">Create Quiz</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Timer (seconds)</label>
          <input 
            type="number" 
            value={timer} 
            onChange={(e) => setTimer(e.target.value)} 
            required 
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Deadline (Date & Time)</label>
          <input 
            type="datetime-local" 
            value={deadline} 
            onChange={(e) => setDeadline(e.target.value)} 
            required 
            className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {questions.map((question, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-md border">
            <h3 className="text-lg font-medium mb-3">Question {index + 1}</h3>
            <input
              type="text"
              placeholder="Question text"
              value={question.questionText}
              onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
              required
              className="w-full p-2 border rounded-md mb-3"
            />
            
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, optIndex, e.target.value)}
                  required
                  className="w-full p-2 border rounded-md bg-white"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Correct Index (0-3)</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value))}
                  required
                  className="mt-1 p-2 border rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                  required
                  className="mt-1 p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={addQuestion}
          className="w-full py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors"
        >
          Add Question
        </button>

        <button 
          type="submit" 
          className="w-full py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Quiz
        </button>
      </form>
    </div>
  );
};

export default CreateQuizForm;