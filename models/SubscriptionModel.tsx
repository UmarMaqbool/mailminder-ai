import React from 'react';
import { IoMdCheckmark } from 'react-icons/io';
import '../styles/stylesSubscriptionModel.css';

const featuresFree = [
  'Suggestions',
  'Tone Adjustment',
  'Communication Context',
  'Limited Email Replies',
  'Limited Suggestions',
];

const featuresMonthly = [
  'Unlimited Emails',
  'Personalized, human-like responses',
  'Unlimited Suggestions',
  'Tone Adjustment',
  'Communication Context',
];

const featuresYearly = [
  'Unlimited Emails',
  'Personalized, human-like responses',
  'Unlimited Suggestions',
  'Tone Adjustment',
  'Communication Context',
];

const SubscriptionModel: React.FC = () => {
  return (
    <>
      <div className="will-be-soon-button">
        {/* <button>Will be Announced Soon</button> */}
      </div>
      <div className="subscription-container">
        <div className="plan">
          <h2>See magic</h2>
          <h1>Free</h1>
          <div style={{ height: '25px' }}></div>
          <p>Basic Reply suggestions and tone adjustment</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="current-plan-button" disabled>
              Current plan
            </button>
          </div>
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: '20px',
            }}
          >
            {featuresFree.map((feature, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <IoMdCheckmark style={{ marginRight: '8px' }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="plan">
          <h2>Monthly</h2>
          <h1>
            $24.99<span>/month</span>
          </h1>
          <div style={{ height: '25px' }}></div>
          <p>Say goodbye to reply limits with our unlimited plan</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="get-unlimited-button">Get Unlimited</button>
          </div>
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: '20px',
            }}
          >
            {featuresMonthly.map((feature, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <IoMdCheckmark style={{ marginRight: '8px' }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="plan">
          <h2>Yearly</h2>
          <h1>
            $10.7<span>/month</span>
          </h1>
          <div style={{ height: '25px' }}>
            <p style={{ color: 'black', fontSize: '12px' }}>
              Billed as $129 / year
              <br />
              (Save $170)
            </p>
          </div>
          <p>Say goodbye to reply limits with our unlimited plan</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="get-unlimited-button">Get Unlimited</button>
          </div>
          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingLeft: '20px',
            }}
          >
            {featuresYearly.map((feature, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <IoMdCheckmark style={{ marginRight: '8px' }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SubscriptionModel;
