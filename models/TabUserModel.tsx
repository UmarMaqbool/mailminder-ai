import React, { useEffect, useState, useRef } from 'react';
import '../styles/stylesUserProfile.css';
import { RiContactsLine } from 'react-icons/ri';
import { CiStar } from 'react-icons/ci';
import SubscriptionModel from './SubscriptionModel';
import { getAuthToken } from '../background';
interface ProfileInfo {
  names?: { displayName: string }[];
  emailAddresses?: { value: string }[];
  photos?: { url: string }[];
}

const TabUserModel: React.FC = () => {
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
      const email = profileInfo.emailAddresses?.[0]?.value;
      if (email) {
        console.log(
          'Profile already exists locally. Skipping backend request.'
        );
        setResponseText(profileInfo);
        setLoading(false);
        return;
      }
      const backendResponse = await fetch(`http://localhost:5000/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileInfo),
      });

      if (backendResponse.ok) {
        console.log('Profile data sent to the backend');
      } else {
        console.log('Error sending profile data to the backend');
      }
      setResponseText(profileInfo);
    } catch (error) {
      console.log('Error fetching profile info:', error);
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
      console.log('Error revoking token:', error);
    }
  };

  const deleteUserData = async () => {
    if (responseText && responseText.emailAddresses?.[0]?.value) {
      const emailAddress = responseText.emailAddresses[0].value;
      try {
        setLoading(true);
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
          await deleteTokenHandler();
          chrome.runtime.sendMessage({ action: 'closeIframe' });
          console.log('User data deleted from the backend');
          setResponseText(null);
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        } else {
          console.log('Error deleting user data from the backend');
        }
      } catch (error) {
        console.log('Error deleting user data:', error);
      }
    } else {
      console.log('No email address available to delete');
    }
  };

  const renderContent = () => {
    if (activeModule === 'Package') {
      return (
        <div className="subscribe">
          <SubscriptionModel />
        </div>
      );
    }
    if (activeModule === 'Profile') {
      return loading ? (
        <div className="spinnerTab"></div>
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
        <div className="logo-header">
          <img
            src="icons/logo_white.png"
            height="32px"
            width="32px"
            style={{ marginBottom: '3px' }}
          />
          <p className="heading">MailMinder</p>
        </div>
        <div
          className={`menu-item ${activeModule === 'Package' ? 'active' : ''}`}
          onClick={() => setActiveModule('Package')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <CiStar style={{ marginRight: '5px', fontSize: '18px' }} />{' '}
          Subscriptions
        </div>
        <div
          className={`menu-item ${activeModule === 'Profile' ? 'active' : ''}`}
          onClick={() => setActiveModule('Profile')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <RiContactsLine
            style={{ marginRight: '8px', fontSize: '15px', marginLeft: '3px' }}
          />{' '}
          Profile
        </div>
        <button onClick={deleteUserData} className="delete-button">
          Delete Account
        </button>
      </div>
      <div className="content">
        <div className="header">
          <div className="profile-header">
            <p className="heading">Profile</p>
          </div>
        </div>
        <hr className="head-divider" />
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
};

export default TabUserModel;
