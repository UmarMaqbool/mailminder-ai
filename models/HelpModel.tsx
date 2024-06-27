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
        <p>
          Welcome to mailminder! Here's how to get the most out of our
          AI-powered reply suggestions:
        </p>

        <h3>Step 1: Sign In</h3>
        <p>
          First, sign in with your Google account. This authentication step is
          necessary to access our features.
        </p>

        <h3>Step 2: Button Appearance</h3>
        <p>
          After signing in, you'll see a new mailminder button in your inbox.
          This button gives you access to our suggested replies.
        </p>

        <h3>Step 3: Suggested Replies</h3>
        <p>
          Click the mailminder button to see three suggested replies that
          perfectly align with your email. Choose any one of them by clicking on
          it, and the text will automatically paste into your reply box.
        </p>

        <h3>Step 4: Select Your Tone</h3>
        <p>
          You can select the tone in which you prefer to reply to the email.
          Available tones include friendly, professional, casual, and more.
        </p>

        <h3>Step 5: Reload Suggestions</h3>
        <p>
          If none of the initial three replies suit your needs, simply click the
          reload button. This will generate another set of three replies with
          improved suggestions.
        </p>

        <p>
          We hope you find mailminder helpful for your email communications. If
          you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    </>
  );
};

export default HelpModel;
