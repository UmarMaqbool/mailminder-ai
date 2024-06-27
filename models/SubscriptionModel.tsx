import React, { useEffect, useState } from 'react';
import { IoMdCheckmark } from 'react-icons/io';
import '../styles/stylesSubscriptionModel.css';
import { getAuthToken } from '../background';

interface User {
  _id: string;
  name: string;
  emailAddress: string;
  photoUrl: string;
  tokenStatus: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const fetchProfile = async () => {
      const authToken = await getAuthToken();
      const email = await fetchProfileInfo();
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile?email=${email}`,
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
        setCurrentUser(data);
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
        console.log(subscriptionPlan, 'SUB PLAN::::');
        setCurrentPlan(subscriptionPlan);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handlePlanChange = async (plan: React.SetStateAction<string>) => {
    if (!currentUser) {
      console.error('User data not available');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser._id, plan }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      setCurrentPlan(plan);
      setLoading(false);
      const result = await response.json();
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
