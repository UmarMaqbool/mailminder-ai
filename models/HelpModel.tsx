import React from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import '../styles/stylesHelpModel.css';

interface HelpModelProps {
  onBack: () => void;
}

const HelpModel: React.FC<HelpModelProps> = ({ onBack }) => {
  return (
    <>
      <button className="back-button" onClick={onBack}>
        <IoMdArrowRoundBack />
      </button>
      <div className="model-container">
        <h2>Help</h2>
        <p>Here you can find help content.</p>
      </div>
    </>
  );
};

export default HelpModel;
