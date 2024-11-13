import React from "react";
import coin from '../assets/coin.png';
import cap from '../assets/cap.png';
import studyKit from '../assets/studyKit.png'; // Update with actual filename
import laptopSleeve from '../assets/laptop.png'; // Update with actual filename

const items = [
  {
    title: "Cap",
    description: "Comes in black or white",
    price: "500",
    image: cap,
  },
  {
    title: "Study Kit",
    description: "Includes t-shirt, keychain, and coaster",
    price: "800",
    image: studyKit,
  },
  {
    title: "Laptop Sleeve",
    description: "Exclusive laptop sleeve",
    price: "1000",
    image: laptopSleeve,
  },
];

const Store = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-black to-[#3b0a45] p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-5 text-center transform transition duration-300 hover:scale-105"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{item.description}</p>
            <div className="text-lg text-yellow-500 flex items-center justify-center">
              {item.price}
              <img
                src={coin}
                alt="coin"
                className="ml-2 w-5 h-5 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Store;
