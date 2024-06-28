import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { TbReload } from 'react-icons/tb';
import '../styles/stylesMainModel.css';
import { getUserInfo } from '../utils/auth';
import { getAuthToken } from '../background';

const MainModel: React.FC = () => {
  const [responseText, setResponseText] = useState<{ text: string }[] | null>(
    null
  );
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(true);
  const user = getUserInfo(); // User ID and email address are saved in local storage and fetched here
  const useRefState = useRef(false);

  const LoadingChatBubble = ({ size }) => {
    const bubbleStyle = {
      width: size === 'large' ? '85%' : '60%',
      height: '25px',
      margin: '10px 0',
      borderRadius: '10px',
      backgroundColor: '#f3f3f3',
      animation: 'pulse 1.5s ease-in-out infinite',
    };

    return <div style={bubbleStyle}></div>;
  };

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'receiveEmailText') {
        // From background.ts it gets the text message of that email
        const emailText = `Please give a formal reply to this email and don't add prompt like here is your email and all stuff just give me the proper response in a good way. \n${message?.response}\nAlso, remember not to add 'Dear [Recipient's Name]' or 'Best regards' in the reply or any other irrelevant things. Make sure the reply is short and simple, not of big length. Give a to-the-point response without adding additional info.`;
        const modifiedEmailText = emailText?.replace('formal', selectedTone); // This replaces the word 'formal' in the emailText with the tone the user selected
        if (modifiedEmailText && modifiedEmailText.includes(selectedTone)) {
          generateResponse(modifiedEmailText);
          useRefState.current = true;
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup function
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedTone]);

  const handleToneChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    const tone = event.target.value;
    setSelectedTone(tone);
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'executeOnClicker' }); // This executes the onClicker that fetches the mail message and then sends it with the message 'receiveEmailText' which we receive here
  };

  // This updates the API count of the user, showing how many API calls this user has used to date
  const updateProfileApiCalls = async (increment: number) => {
    try {
      await fetch(`http://localhost:5000/api/profile/updateApiCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id, increment }),
      });
    } catch (error) {
      console.log('Failed to update API calls:', error);
    }
  };

  // This updates the API count of the user for the specific plan they subscribed to
  const updatePlanApiCounts = async (increment: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/subscription/updateApiCount`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user?.id, increment }),
        }
      );
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.message || 'Failed to update API calls');
      }
      return data;
    } catch (error) {
      console.log('Failed to update API calls:', error);
    }
  };

  const generateResponse = async (modifiedEmailText: string) => {
    try {
      const token = await getAuthToken();
      setLoading(true);
      const updateApiCountResponse = await updatePlanApiCounts(3); // This will check if the user has crossed the API count limit for the free plan, and if so, prompt them to upgrade their plan
      if (!updateApiCountResponse?.ok) {
        setResponseText([
          { text: 'Please update your plan to continue using the service.' },
        ]);
        setLoading(false);
        return;
      }
      await updateProfileApiCalls(3);
      await fetchProfileInfo(token, true, 0);
      const fetchResponse = async () => {
        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer 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',
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: modifiedEmailText,
                },
              ],
              model: 'gryphe/mythomist-7b:free',
              max_token: 30, // This allows the response a maximum of 30 words
            }),
          }
        );
        const dataJson = await response.json();
        const choice = dataJson.choices[0];
        const responseContent = choice?.message.content;

        return responseContent ? { text: responseContent } : null;
      };
      const responses = await Promise.all([
        fetchResponse(),
        fetchResponse(),
        fetchResponse(),
      ]);
      const validResponses = responses.filter(
        (response) => response !== null
      ) as { text: string }[];

      if (validResponses.length === 3) {
        setResponseText(validResponses);
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error:', error);
      await updatePlanApiCounts(-3); // If the API count increases and an error occurs with the OpenAI API, it will decrement that count
      await updateProfileApiCalls(-3);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileInfo = async (
    token: string | undefined,
    status: boolean,
    apiCalls: number
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

  const handleResponseClick = (response: string) => {
    // This sends the response to the contentScript where it should be pasted in the reply box
    chrome.runtime.sendMessage({
      action: 'suggestedText',
      suggestion: response,
    });
  };

  const handleCloseButton = () => {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  const handleReloadClick = async () => {
    // This executes the onClicker with the selected tone
    setLoading(true);
    useRefState.current = false;
    chrome.runtime.sendMessage({
      action: 'executeOnClicker',
      selectedTone: selectedTone,
    });
  };

  return (
    <div className="container">
      <div>
        <div className="header">
          <div className="logo-header">
            <img
              src="icons/logo_white.png"
              height="28px"
              width="28px"
              style={{ marginBottom: '3px' }}
            />
            <p className="heading">Email Reply Tone</p>
          </div>
          <div className="tone-header">
            <div className="select-container">
              <div className="selector">
                <span role="img" aria-label="Bulb" className="icon">
                  <img
                    src="https://img.freepik.com/premium-vector/light-bulb-with-cogwheel-icon_859093-166.jpg?w=1480"
                    height="20px"
                    width="20px"
                  />
                  <p className="tone-header-text">Tone</p>
                </span>
              </div>
              <select
                id="toneSelect"
                className="select"
                onChange={handleToneChange}
              >
                <option value="formal">👔 Formal</option>
                <option value="professional">💼 Professional</option>
                <option value="enthusiastic">🌟 Enthusiastic</option>
                <option value="not_interested">🚫 Not Interested</option>
                <option value="impower">💪 Empower</option>
                <option value="attractive">😍 Attractive</option>
              </select>
            </div>
            <button
              className="close-button"
              onClick={handleCloseButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffecec';
                e.currentTarget.style.borderRadius = '50%';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              &#x2715;
            </button>
          </div>
        </div>
        <hr className="head-divider" />
        <div>
          {loading ? (
            <div>
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {responseText ? (
                responseText.map((response, index) => (
                  <div key={index}>
                    <p
                      className="response-item"
                      onClick={() => handleResponseClick(response.text)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f7f7f7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {response.text}
                    </p>
                    {index < responseText.length - 1 && (
                      <hr className="reply-divider" />
                    )}
                  </div>
                ))
              ) : (
                <p className="response-item">No response available</p>
              )}
              {!loading ? (
                <button className="reload-button" onClick={handleReloadClick}>
                  <TbReload />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainModel;
