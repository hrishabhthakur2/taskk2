/* eslint-disable react/prop-types */
import React from 'react';

const getHashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Konversi ke 32-bit integer
  }
  return hash;
};

const Avatar = ({ username, online }: { username: any, online: boolean }) => {
  const colors = [
    'bg-red-200',
    'bg-green-200',
    'bg-blue-200',
    'bg-yellow-200',
    'bg-purple-200',
    'bg-pink-200',
    'bg-indigo-200',
    'bg-teal-200',
    'bg-orange-200',
    'bg-cyan-200',
  ];

  // Dapatkan nilai hash dari username
  const hash = getHashCode(username);

  // Gunakan nilai hash untuk memilih warna secara acak
  const randomColor = colors[Math.abs(hash) % colors.length];

  return (
    <div className={`w-8 h-8 relative rounded-full flex items-center ${randomColor}`}>
      <div className="text-center w-full opacity-70 uppercase font-semibold">{username[0]}</div>
			{online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
			{!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
