import React from "react";

const Loading = () => {
  return (
    <div>
      {" "}
      <div className="m-auto w-10/12 pt-20">
        <div className="min-h-full flex items-center justify-center">
          <div>
            <div className="relative">
              <img
                src="/img/dog.gif"
                className="w-[300px] h-[300px] mt-20"
                alt="coming soon img"
              />
              <div className="absolute w-[304px] h-[224px] top-[-120px] right-[-220px]">
                <img src="/img/CloudShapeLoading.svg" alt="coming soon text" />
              </div>
              <div className="absolute bottom-[60px] w-[150px] right-1/4">
                <div className="relative">
                  <img src="/img/place.svg" alt="place" />
                  <div className="bottom-1.5 left-px absolute">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="15"
                      viewBox="0 0 13 15"
                      fill="none"
                    >
                      <path
                        d="M5.90576 14.1407C7.16593 9.76172 10.1021 1.11716 11.7654 1.57089C13.4287 2.02463 8.55201 10.1398 5.90576 14.1407Z"
                        fill="#32A675"
                      />
                      <path
                        d="M6.69471 14.8527C5.65631 10.4159 3.99777 1.43824 5.67086 1.02207C7.34395 0.605905 7.05055 10.0691 6.69471 14.8527Z"
                        fill="#32A675"
                      />
                      <path
                        d="M6.94727 14.1407C5.6871 9.76172 2.75094 1.11716 1.08765 1.57089C-0.575648 2.02463 4.30102 10.1398 6.94727 14.1407Z"
                        fill="#32A675"
                      />
                    </svg>
                  </div>
                  <div className="absolute right-1 bottom-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="35"
                      viewBox="0 0 18 35"
                      fill="none"
                    >
                      <path
                        d="M5.90576 34.1407C7.16593 29.7617 10.1021 21.1172 11.7654 21.5709C13.4287 22.0246 8.55201 30.1398 5.90576 34.1407Z"
                        fill="#32A675"
                      />
                      <path
                        d="M6.69471 34.8527C5.65631 30.4159 3.99777 21.4382 5.67086 21.0221C7.34395 20.6059 7.05055 30.0691 6.69471 34.8527Z"
                        fill="#32A675"
                      />
                      <path
                        d="M6.94727 34.1407C5.6871 29.7617 2.75094 21.1172 1.08765 21.5709C-0.575648 22.0246 4.30102 30.1398 6.94727 34.1407Z"
                        fill="#32A675"
                      />
                      <path
                        d="M6.37012 29.9741C6.40595 23.4119 6.91866 19.7716 8.97119 13.3682"
                        stroke="#32A675"
                        strokeWidth="0.5"
                      />
                      <path
                        d="M16.2922 7.21658C16.9248 3.23134 12.8461 -0.831332 8.98672 3.9935C6.05271 -0.261686 1.19169 1.57596 1.61088 6.78833C1.68796 7.74675 2.17797 8.61271 2.81063 9.33676L8.98672 16.4049L15.3345 9.03343C15.7896 8.50498 16.1829 7.90535 16.2922 7.21658Z"
                        fill="#FFC5A8"
                        stroke="#FFC5A8"
                        strokeOpacity="0.1"
                        strokeWidth="2.46201"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
