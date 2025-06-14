import React, { useState } from 'react';

function Doubt() {
  const [doubt, setDoubt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doubt.trim()) return;
    console.log(e);
    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch('http://localhost:5000/api/v1/solveDoubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doubt }),
      });

      const data = await res.text(); // If backend returns plain text
      setAnswer(data);
    } catch (err) {
      setAnswer('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Ask Your Doubt</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="5"
          placeholder="Type your doubt here..."
          value={doubt}
          onChange={(e) => setDoubt(e.target.value)}
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Solving...' : 'Submit'}
        </button>
      </form>

      {answer && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Answer:</h3>
          <p className="text-gray-700 whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default Doubt;
