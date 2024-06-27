import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import './stylesCommunityModel.css';

interface FeedbackModelProps {
  onBack: () => void;
}

const CommunityModel: React.FC<FeedbackModelProps> = ({ onBack }) => {
  return (
    <>
      <button className="back-button" onClick={onBack}>
        <IoMdArrowRoundBack />
      </button>
      <div className="model-container">
        <h2>Community</h2>
        <p>Here is your community members</p>
      </div>
    </>
  );
};

export default CommunityModel;
