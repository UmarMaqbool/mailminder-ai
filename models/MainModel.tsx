import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { TbReload } from 'react-icons/tb';
import '../styles/stylesMainModel.css';
const MainModel: React.FC = () => {
  const [responseText, setResponseText] = useState<{ text: string }[] | null>(
    null
  );
  const [selectedTone, setSelectedTone] = useState<string>('formal');
  const [loading, setLoading] = useState<boolean>(true);
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
      if (
        message.action == 'receiveEmailText' ||
        message.action == 'generateEmailText'
      ) {
        const emailText = `Please give a formal reply to this email and don't add prompt like here is you email and all stuff just give me the proper response in a good way \n ${message?.response}\nalso remember not to add Dear [Recipient's Name], or best regards in the reply or any other irrelevant things and make sure the reply should be short and simple not of big length`;
        const modifiedEmailText = emailText?.replace('formal', selectedTone);
        if (modifiedEmailText && modifiedEmailText.includes(selectedTone)) {
          generateResponse(modifiedEmailText);
          useRefState.current = true;
        }
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [selectedTone]);

  const handleToneChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const tone = event.target.value;
    setSelectedTone(tone);
    useRefState.current = false;
    chrome.runtime.sendMessage({ action: 'generateEmailText' });
  };

  const generateResponse = async (modifiedEmailText: string) => {
    try {
      setLoading(true);
      const fetchResponse = async () => {
        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completion',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
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
              model: 'llama3-8b-8192',
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
      console.error('Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleResponseClick = (response: string) => {
    chrome.runtime.sendMessage({
      action: 'suggestedText',
      suggestion: response,
    });
  };

  const handleCloseButton = () => {
    chrome.runtime.sendMessage({ action: 'closeIframe' });
  };

  const handleReloadClick = async () => {
    setLoading(true);
    useRefState.current = false;
    chrome.runtime.sendMessage({
      action: 'generateEmailText',
      selectedTone: selectedTone,
    });
  };

  return (
    <div className="container">
      <div>
        <div className="header">
          <div className="logo-header">
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height="28px"
              width="28px"
              style={{ borderRadius: '50%' }}
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
