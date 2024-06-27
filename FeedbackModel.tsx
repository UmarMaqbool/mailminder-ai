import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import './stylesFeedbackModel.css';

interface FeedbackModelProps {
  onBack: () => void;
}

const FeedbackModel: React.FC<FeedbackModelProps> = ({ onBack }) => {
  return (
    <>
      <button className="back-button" onClick={onBack}>
        <IoMdArrowRoundBack />
      </button>
      <div className="model-container">
        <h2>Feedback</h2>
        <p>Provide your feedback here.</p>
      </div>
    </>
  );
};

export default FeedbackModel;
