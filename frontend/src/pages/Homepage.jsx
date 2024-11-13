import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    <div className="bg-gradient-to-t from-black to-[#3b0a45] flex flex-col items-center  h-screen">
      {/* Header section */}
      <header className="w-full p-8 flex justify-end">
        <div className='flex gap-10 font-serif text-xl text-white'>
          <Link to="/login" className="hover:text-gray-300 ">Login</Link>
          <Link to="/register" className="hover:text-gray-300">Register</Link>
          <Link to="/mentorship" className="hover:text-gray-300">Mentorship</Link>
          <Link to="/store" className='hover:text-gray-300'>Store</Link>
        </div>
      </header>
      {/* Main content section */}
      <div className=" p-8 rounded-lg shadow-lg border-neutral-50 mt-20">
        <h1 className="text-center text-white font-serif font-bold  text-5xl">Welcome</h1>
        <h2 className="text-center text-white font-serif text-xl mt-2">Be ready to boost your performance</h2>
      
      </div>
    </div>
  );
}

export default Homepage; 