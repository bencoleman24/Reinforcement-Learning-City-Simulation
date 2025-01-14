import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const MESSAGES = [
  { text: "Training government RL agent on your city...", duration: 15000 },
  { text: "Running city simulation...", duration: 10000 },
  { text: "Preparing analytics and results...", duration: null },
];

export default function LoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userConfig = location.state?.userConfig;

  const [loadingMessage, setLoadingMessage] = useState(MESSAGES[0].text);
  const currentMessageIndex = useRef(0);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    if (!userConfig) {
      setLoadingMessage("No configuration found. Return home.");
      return;
    }

    const goToNextMessage = () => {
      currentMessageIndex.current += 1;
      if (currentMessageIndex.current < MESSAGES.length) {
        setLoadingMessage(MESSAGES[currentMessageIndex.current].text);
        const nextDuration = MESSAGES[currentMessageIndex.current].duration;

        if (nextDuration) {
          timeoutIdRef.current = setTimeout(goToNextMessage, nextDuration);
        }
      }
    };

    timeoutIdRef.current = setTimeout(goToNextMessage, MESSAGES[0].duration);

    axios
      .post("/run_sim", userConfig)
      .then((resp) => {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        navigate("/results", { state: { simData: resp.data } });
      })
      .catch((error) => {
        console.error("Error during simulation:", error);
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        setLoadingMessage("Simulation failed. Please try again.");
      });

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [userConfig, navigate]);

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2 style={{ marginBottom: "1rem" }} aria-live="polite">
        {loadingMessage}
      </h2>

      <p>
        Please wait while we run everything!{" "}
        <span style={{ fontStyle: "italic" }}>
          (Should take about 30 sec)
        </span>
      </p>

      {!userConfig && (
        <button onClick={handleReturnHome} style={{ marginTop: "1rem" }}>
          Return to Home
        </button>
      )}

      <div className="coin-wrapper">
        <div className="coin"></div>
        <div className="coin"></div>
        <div className="coin"></div>
      </div>

      <style>
        {`
          .coin-wrapper {
            margin-top: 150px;
            text-align: center;
          }

          .coin {
            display: inline-block;
            width: 50px;
            height: 50px;
            margin: 0 10px;
            background: radial-gradient(circle at 30% 30%, #26a69a, #26a69a);
            border-radius: 50%;
            animation: bounce 1.8s infinite ease-in-out;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
          }

          .coin:nth-child(2) {
            animation-delay: 0.3s;
          }

          .coin:nth-child(3) {
            animation-delay: 0.6s;
          }

          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translateY(0);
            }
            40%, 43% {
              transform: translateY(-30px);
            }
            70% {
              transform: translateY(-15px);
            }
            90% {
              transform: translateY(-4px);
            }
          }

          @media (max-width: 600px) {
            .coin {
              width: 30px;
              height: 30px;
            }
          }
        `}
      </style>
    </div>
  );
}
