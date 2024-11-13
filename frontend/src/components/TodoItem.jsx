import React from 'react';
import tick from '../assets/tick.png';
import untick from '../assets/untick.png';
import delete_icon from '../assets/delete.png';

const TodoItems = ({ title, description, points, dueDate, id, isComplete, deleteTodo, toggle }) => {
  return (
    <div className='flex items-center my-3 gap-2 border-b border-gray-300 pb-2'>
      <div onClick={() => { toggle(id) }} className='flex flex-1 items-center cursor-pointer'>
        <img src={isComplete ? tick : untick} alt="" className='w-7' />
        <div className='ml-4'>
          <p className={`text-slate-700 text-lg ${isComplete ? "line-through" : ""}`}>{title}</p>
          <p className='text-slate-500 text-sm'>{description}</p>
          <p className='text-slate-500 text-sm'>Points: {points} | Due: {new Date(dueDate).toLocaleDateString()}</p>
        </div>
      </div>
      <img onClick={() => { deleteTodo(id) }} src={delete_icon} alt="" className='w-7 cursor-pointer' />
    </div>
  );
}

export default TodoItems;
