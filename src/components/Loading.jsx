import React from "react";
import { ClipLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <ClipLoader
          color={"#000"}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="mt-4 text-lg text-gray-700 font-semibold animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;
