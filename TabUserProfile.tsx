import React, { useEffect, useState, useRef } from 'react';
import './stylesTabUserProfile.css';
import { getAuthToken } from './background';

interface ProfileInfo {
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  photos?: { url: string }[];
}

const TabUserProfile: React.FC = () => {
  const [responseText, setResponseText] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<string>('Profile');
  const useRefState = useRef(false);

  useEffect(() => {
    generateResponse();
    const messageListener = (message: any) => {
      useRefState.current = true;
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const generateResponse = async () => {
    const token = await getAuthToken();
    try {
      setLoading(true);
      const response = await fetch(
        `https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const profileInfo = await response.json();
      const backendResponse = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileInfo),
      });

      if (backendResponse.ok) {
        console.log('Profile data sent to the backend');
      } else {
        console.error('Error sending profile data to the backend');
      }
      setResponseText(profileInfo);
    } catch (error) {
      console.error('Error fetching profile info:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTokenHandler = async () => {
    try {
      const token = await getAuthToken(false);
      if (token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        chrome.identity.removeCachedAuthToken({ token }, () => {
          setResponseText(null);
          console.log('Token revoked and deleted');
        });
      } else {
        console.log('No token found.');
      }
    } catch (error) {
      console.error('Error revoking token:', error);
    }
  };

  const deleteUserData = async () => {
    if (responseText && responseText.emailAddresses?.[0]?.value) {
      const emailAddress = responseText.emailAddresses[0].value;
      try {
        const backendResponse = await fetch(
          `http://localhost:5000/api/profile`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emailAddress }),
          }
        );

        if (backendResponse.ok) {
          deleteTokenHandler();
          console.log('User data deleted from the backend');
          setResponseText(null);
        } else {
          console.error('Error deleting user data from the backend');
        }
      } catch (error) {
        console.error('Error deleting user data:', error);
      }
    } else {
      console.error('No email address available to delete');
    }
  };

  const renderContent = () => {
    if (activeModule === 'Package') {
      return <div style={{ marginTop: '2em' }}>Subscriptions</div>;
    }
    if (activeModule === 'Profile') {
      return loading ? (
        <div className="spinner"></div>
      ) : (
        <div style={{ display: 'flex' }}>
          {responseText ? (
            <div className="user-profile-container">
              <div className="user-info">
                <p className="user-name">
                  Name:{' '}
                  {responseText.names?.[0]?.displayName ||
                    'No display name available'}
                </p>
                <p className="user-email">
                  Email:{' '}
                  {responseText.emailAddresses?.[0]?.value ||
                    'No email available'}
                </p>
              </div>
              <img
                src={responseText.photos?.[0]?.url || 'default-photo-url'}
                alt="Profile"
                className="user-pic"
              />
            </div>
          ) : (
            <p className="no-profile">No Profile Available</p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="tab-container">
      <div className="sidebar">
        <div
          className={`menu-item ${activeModule === 'Package' ? 'active' : ''}`}
          onClick={() => setActiveModule('Package')}
        >
          📦 Subscriptions
        </div>
        <div
          className={`menu-item ${activeModule === 'Profile' ? 'active' : ''}`}
          onClick={() => setActiveModule('Profile')}
        >
          👤 Profile
        </div>
        <button onClick={deleteUserData} className="delete-button">
          Delete Account
        </button>
      </div>
      <div className="content">
        <div className="header">
          <div className="logo-header">
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height="32px"
              width="32px"
              style={{ borderRadius: '50%' }}
            />
            <p className="heading">Profile</p>
          </div>
        </div>
        <hr className="head-divider" />
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
};

export default TabUserProfile;
