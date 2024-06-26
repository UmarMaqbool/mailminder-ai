import React, { useEffect, useState } from 'react';
import { IoMdCheckmark } from 'react-icons/io';
import '../styles/stylesSubscriptionModel.css';
import { getUserInfo } from '../utils/auth';
import { getAuthToken } from '../background';

interface User {
  _id: string;
  name: string;
  emailAddress: string;
  photoUrl: string;
  status: boolean;
  apiCalls: number;
  subscriptionPlan: string;
}

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
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const user = getUserInfo();

  useEffect(() => {
    const fetchProfile = async () => {
      const authToken = await getAuthToken();

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile?email=${user?.emailAddress}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setCurrentPlan(data.subscriptionPlan);
        const subscriptionResponse = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscription/${data._id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!subscriptionResponse.ok) {
          throw new Error('Failed to fetch subscription plan');
        }

        const { subscriptionPlan } = await subscriptionResponse.json();
        setCurrentPlan(subscriptionPlan?.plan);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePlanChange = async (planTitle: string) => {
    if (!user?.id) {
      console.error('User data not available');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, planTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const result = await response.json();
      setCurrentPlan(result.subscription.plan);
      setLoading(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setLoading(false);
    }
  };
  return (
    <>
      <div className="will-be-soon-button">
        {/* <button>Will Be Added Soon</button> */}
      </div>
      <div className="subscription-container">
        <div className="plan">
          <h2>See magic</h2>
          <h1>Free</h1>
          <div style={{ height: '25px' }}></div>
          <p>Basic Reply suggestions and tone adjustment</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {loading ? (
              <div className="loader"></div>
            ) : (
              <button
                className="get-unlimited-button"
                style={{
                  backgroundColor: currentPlan === 'free' ? 'gray' : '#87150b',
                  cursor: currentPlan === 'free' ? 'not-allowed' : 'pointer',
                }}
                disabled={currentPlan === 'free'}
                onClick={() => handlePlanChange('free')}
              >
                {currentPlan === 'free' ? 'Current plan' : 'Select Free'}
              </button>
            )}
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
            {loading ? (
              <div className="loader"></div>
            ) : (
              <button
                className="get-unlimited-button"
                style={{
                  backgroundColor:
                    currentPlan === 'monthly' ? 'gray' : '#87150b',
                  cursor: currentPlan === 'monthly' ? 'not-allowed' : 'pointer',
                }}
                disabled={currentPlan === 'monthly'}
                onClick={() => handlePlanChange('monthly')}
              >
                {currentPlan === 'monthly' ? 'Current plan' : 'Get Unlimited'}
              </button>
            )}
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
            {loading ? (
              <div className="loader"></div>
            ) : (
              <button
                className="get-unlimited-button"
                style={{
                  backgroundColor:
                    currentPlan === 'yearly' ? 'gray' : '#87150b',
                  cursor: currentPlan === 'yearly' ? 'not-allowed' : 'pointer',
                }}
                disabled={currentPlan === 'yearly'}
                onClick={() => handlePlanChange('yearly')}
              >
                {currentPlan === 'yearly' ? 'Current plan' : 'Get Unlimited'}
              </button>
            )}
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
