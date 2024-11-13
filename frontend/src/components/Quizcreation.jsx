import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const CreateQuizForm = () => {
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }
  ]);

  // Handler to add new question
  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 0 }]);
  };

  // Handler to update question data
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for required fields
    if (!title || !timer || questions.some(q => !q.questionText || q.options.some(opt => !opt))) {
      toast.error('Please fill in all fields.');
      return;
    }

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If there is no token, show an error and return
    if (!token) {
      toast.error('No authentication token found.');
      return;
    }

    try {
      // Send the POST request to create the quiz
      const response = await axios.post(
        'http://localhost:5000/api/v1/postquizzes',
        { title, questions, timer: parseInt(timer, 10) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // If the quiz was created successfully
      toast.success('Quiz created successfully!');
      
    } catch (error) {
      // If the request failed (e.g., user is not authorized)
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please check your credentials or permissions.');
    }
  };

  return (
    <div className="quiz-form p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto mt-10">
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

        {questions.map((question, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-md border">
            <h3 className="text-lg font-medium mb-3">Question {index + 1}</h3>
            <input
              type="text"
              placeholder="Question text"
              value={question.questionText}
              onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-3"
            />
            
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...question.options];
                    updatedOptions[optIndex] = e.target.value;
                    updateQuestion(index, 'options', updatedOptions);
                  }}
                  required
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <div className="flex flex-col mt-3">
              <label className="text-sm font-medium text-gray-600">Correct Answer (index)</label>
              <input
                type="number"
                min="0"
                max="3"
                value={question.correctAnswer}
                onChange={(e) => updateQuestion(index, 'correctAnswer', parseInt(e.target.value))}
                required
                className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col mt-3">
              <label className="text-sm font-medium text-gray-600">Points</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                required
                className="mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
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
