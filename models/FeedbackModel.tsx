import React, { useState, useEffect } from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import emailjs from 'emailjs-com';
import '../styles/stylesFeedbackModel.css';
import { getAuthToken } from '../background';

interface FeedbackModelProps {
  onBack: () => void;
}

const fetchProfileInfo = async (): Promise<string | undefined> => {
  const token = await getAuthToken();
  const response = await fetch(
    'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const profileInfo = await response.json();
  return profileInfo.emailAddresses?.[0]?.value;
};

const FeedbackModel: React.FC<FeedbackModelProps> = ({ onBack }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getEmail = async () => {
      const email = await fetchProfileInfo();
      setUserEmail(email || '');
    };
    getEmail();
  }, []);

  const sendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      feedback,
      userEmail,
    };

    emailjs
      .send(
        'service_d2qjxj6',
        'template_l9ipj9v',
        templateParams,
        'PV02uSJkTcSgE5AIf'
      )
      .then((response) => {
        alert('SUCCESS!! ' + response.status);
        setFeedback('');
        setIsSubmitting(false);
      })
      .catch((err) => {
        console.log('FAILED...', err);
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <button className="back-button" onClick={onBack}>
        <IoMdArrowRoundBack />
      </button>
      <div className="model-container">
        <h2>Feedback</h2>
        <p>Provide your feedback here.</p>
        <form onSubmit={sendFeedback}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback"
            required
            className="textarea-field"
          />
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </>
  );
};

export default FeedbackModel;
