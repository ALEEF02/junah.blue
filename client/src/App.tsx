import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS is Working! 🎉
        </h1>
        <p className="text-gray-600">
          If you can see this styled card, Tailwind is configured correctly.
        </p>
      </div>
    </div>
  );
}

export default App;