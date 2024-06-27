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
      const response = await fetchProfileInfo(token, true, 0);
      if (useRefState.current) {
        setAuthenticated(true);
        setResponseText(response.profileImage || 'default-photo-url');
      }
    } catch (error) {
      if (useRefState.current) {
        setAuthenticated(false);
      }
      console.log('Error fetching profile info:', error);
    } finally {
      if (useRefState.current) {
        setLoading(false);
      }
    }
  };

  const fetchProfileInfo = async (
    token: string | undefined,
    status: boolean,
    apiCalls: Number
  ) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, status, apiCalls }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile info from backend');
      }

      const profileInfo = await response.json();
      const { id, emailAddress } = profileInfo;
      localStorage.setItem('user', JSON.stringify({ id, emailAddress }));
      return profileInfo;
    } catch (error) {
      console.log('Error in fetchProfileInfoFromBackend:', error);
      setLoading(false);
      throw new Error('Network response was not ok');
    }
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
        console.log('No active tab found');
      }
    } catch (error) {
      console.log('Error getting auth token or querying tabs: ', error);
    }
  };

  const onGoogleButtonHandler = async () => {
    await generateResponse();
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
      console.log('Error revoking token:', error);
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
              src="icons/logo_white.png"
              height={'28px'}
              width={'28px'}
              style={{ marginBottom: '2px' }}
              alt="EvolveBay Logo"
            />
            <p className="heading">MailMinder</p>
          </div>
          {authenticated ? (
            <img
              src={responseText || 'default-photo-url'}
              alt="Profile"
              className="user-pic"
              onClick={onProfileHandler}
            />
          ) : (
            <button
              onClick={onGoogleButtonHandler}
              className="google-button"
              disabled={loading}
            >
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
