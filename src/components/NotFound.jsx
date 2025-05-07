import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col justifys-center items-center h-screen bg-gray-100 text-center p-6">
      <h1 className="text-6xl font-bold text-red-500 mb-6">
        404 - Page Not Found
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <a
        href="/chat"
        className="text-lg text-blue-500 border-2 border-blue-500 rounded-lg px-6 py-3 transition duration-300 ease-in-out transform hover:bg-blue-500 hover:text-white"
      >
        Go to Home
      </a>
    </div>
  );
};

export default NotFound;
