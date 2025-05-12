import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Loading Spinner and Message */}
      <div className="text-center space-y-6">
        {/* Rotating Spinner */}
        <div className="w-20 h-20 border-8 border-t-8 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>

        {/* Progress Bar */}
        <div className="relative pt-2">
          <div className="flex mb-2 items-center justify-between">
            <span className="text-sm text-gray-600">Loading...</span>
            <span className="text-sm text-gray-600">0%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-blue-500 h-2 rounded-full w-[50%]"></div>{" "}
            {/* Dynamic width can be controlled */}
          </div>
        </div>

        {/* Text indicator */}
        <div className="text-gray-600 text-lg">
          <p>Please wait, we are preparing something great for you!</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
