import React, { useEffect, useState, useRef } from 'react';
import { getAuthToken } from './background';
import './styles/stylesApp.css';
import HelpModel from './models/HelpModel';
import FeedbackModel from './models/FeedbackModel';
import CommunityModel from './models/CommunityModel';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [responseText, setResponseText] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const useRefState = useRef(false);

  useEffect(() => {
    useRefState.current = true;
    if (!authenticated) {
      generateResponse();
    }
    return () => {
      useRefState.current = false;
    };
  }, []);

  const generateResponse = async () => {
    try {
      const token = await getAuthToken();
      setLoading(true);
      const response = await fetchProfileInfo(token);
      if (useRefState.current) {
        setAuthenticated(true);
        setResponseText(response.photos?.[0]?.url || 'default-photo-url');
      }
    } catch (error) {
      if (useRefState.current) {
        setAuthenticated(false);
      }
      console.error('Error fetching profile info:', error);
    } finally {
      if (useRefState.current) {
        setLoading(false);
      }
    }
  };

  const fetchProfileInfo = async (token: string | undefined) => {
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const profileInfo = await response.json();
    await fetch('http://localhost:5000/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileInfo),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return profileInfo;
  };

  const onProfileHandler = async () => {
    try {
      const token = await getAuthToken();
      const tabs = await chrome?.tabs?.query({
        active: true,
        currentWindow: true,
      });
      if (Array.isArray(tabs) && tabs.length > 0) {
        const activeTab = tabs[0];
        const gmailPattern = /https:\/\/mail\.google\.com\//;

        if (activeTab.url && gmailPattern.test(activeTab.url)) {
          chrome.tabs.sendMessage(activeTab.id || 0, '');
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTab.id || 0, {
              action: 'openUserProfile',
              token: token,
            });
          }, 300);
        } else {
          const newUrl = chrome.runtime.getURL('tabInfoModel.html');
          chrome.tabs.create({ url: newUrl }, (newTab) => {
            chrome.tabs.onUpdated.addListener(function listener(
              tabId,
              changeInfo
            ) {
              if (tabId === newTab?.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.tabs.sendMessage(tabId, {
                  action: 'showUserProfile',
                  token: token,
                });
              }
            });
          });
        }
      } else {
        console.error('No active tab found');
      }
    } catch (error) {
      console.error('Error getting auth token or querying tabs: ', error);
    }
  };

  const onGoogleButtonHandler = () => {
    generateResponse();
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
          setAuthenticated(false);
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

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'Help':
        return <HelpModel onBack={() => setActiveModule(null)} />;
      case 'Feedback':
        return <FeedbackModel onBack={() => setActiveModule(null)} />;
      case 'Community':
        return <CommunityModel onBack={() => setActiveModule(null)} />;
      default:
        return renderMainPopup();
    }
  };

  const renderMainPopup = () => {
    return (
      <>
        <div className="header">
          <div className="logo-header">
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height={'28px'}
              width={'28px'}
              style={{ borderRadius: '50%' }}
              alt="EvolveBay Logo"
            />
            <p className="heading">EvolveBay</p>
          </div>
          {authenticated ? (
            <img
              src={responseText || 'default-photo-url'}
              alt="Profile"
              className="user-pic"
              onClick={onProfileHandler}
            />
          ) : (
            <button onClick={onGoogleButtonHandler} className="google-button">
              <img
                src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png"
                alt="Google Logo"
                className="google-logo"
              />
              Login
            </button>
          )}
        </div>
        <hr className="head-divider" />
        {authenticated ? (
          <div>
            <div className="table-container">
              <div className="table-row">
                <button
                  className="table-cell"
                  onClick={() => setActiveModule('Help')}
                >
                  <span role="img" aria-label="help" className="icon">
                    ❓
                  </span>
                  Need Help
                </button>
              </div>
              <div className="table-row">
                <button
                  className="table-cell"
                  onClick={() => setActiveModule('Feedback')}
                >
                  <span role="img" aria-label="feedback" className="icon">
                    💬
                  </span>
                  Provide Feedback
                </button>
              </div>
              <div className="table-row">
                <button
                  className="table-cell"
                  onClick={() => setActiveModule('Community')}
                >
                  <span role="img" aria-label="community" className="icon">
                    👥
                  </span>
                  Community
                </button>
              </div>
            </div>
            <button onClick={deleteTokenHandler} className="logout-button">
              Logout
            </button>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="container">
      {loading ? <div className="spinner"></div> : renderActiveModule()}
    </div>
  );
}

const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 2em;
  height: 2em;
  animation: spin 1s linear infinite;
  margin: 4em auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = spinnerStyle;
document.head.appendChild(styleElement);

export default App;
