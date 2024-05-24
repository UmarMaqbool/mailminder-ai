import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
const EmailSuggestions: React.FC = () => {
  const containerStyle = {
    backgroundColor: '#fffff',
    padding: '20px',
    width: '525px',
    margin: '-12px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    marginTop: '10px',
    marginLeft: '12px',
  };

  const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };

  const logoHeader = {
    display: 'flex',
    alignItems: 'center',
  };

  const toneHeader = {
    display: 'flex',
  };

  const toneHeaderText = {
    width: '100%',
    padding: '7px 0px 0px 3px',
    marginTop: '10px',
    marginRight: '3px',
    fontSize: '13.5px',
  };

  const headDivider = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    margin: '18px 0px 6px 0px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const replyDivider = {
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const selectContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cfcfcf',
    borderRadius: '5px',
    padding: '0px 7px',
    marginRight: '15px',
  };

  const selectStyle = {
    width: 'auto',
    padding: '10px 24px 10px 18px',
    borderRadius: '10px',
    border: 'none',
    margin: '0px',
    backgroundColor: '#deedff',
    fontSize: '13.5px',
    outline: 'none',
  };

  const selectorStyle = {
    marginRight: '0px',
  };

  const iconStyle = {
    display: 'flex',
    marginRight: '5px',
    marginLeft: '0px',
    alignItems: 'center',
  };

  const responseItemStyle = {
    cursor: 'pointer',
    padding: '8px',
    margin: '5px 0px',
    backgroundColor: '#fffff',
    borderRadius: '4px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    color: '#4d4d4d',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  };

  const closeButton = {
    marginTop: '0px',
    height: '35px',
    width: '35px',
    fontSize: '20px',
    color: '#87150b',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };

  const pulseAnimation = `@keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.01);
    }
    100% {
      transform: scale(1);
    }
  }`;

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
      if (message.action === 'receiveEmailText' && !useRefState.current) {
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
          'https://openrouter.ai/api/v1/chat/completions',
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
              model: 'openai/gpt-3.5-turbo',
              max_tokens: 200,
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

  return (
    <div
      style={{
        ...containerStyle,
      }}
    >
      <div>
        <div style={header}>
          <div style={logoHeader}>
            <img
              src="https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I"
              height={'28px'}
              width={'28px'}
              style={{ borderRadius: '50%' }}
            ></img>
            <p style={headingStyle}>Email Reply Tone</p>
          </div>
          <div style={toneHeader}>
            <div style={selectContainerStyle}>
              <div style={selectorStyle}>
                <span role="img" aria-label="Bulb" style={iconStyle}>
                  <img
                    src="https://img.freepik.com/premium-vector/light-bulb-with-cogwheel-icon_859093-166.jpg?w=1480"
                    height={'20px'}
                    width={'20px'}
                  ></img>
                  <p style={toneHeaderText}>Tone</p>
                </span>
              </div>
              <select
                id="toneSelect"
                style={{
                  ...selectStyle,
                }}
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
              className="close_button"
              style={closeButton}
              onClick={() => handleCloseButton()}
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
        <hr style={headDivider} />
        <div>
          {loading ? (
            <div>
              <style>{pulseAnimation}</style>
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="small" />
              <LoadingChatBubble size="large" />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {responseText ? (
                responseText.map((response, index) => (
                  <div key={index}>
                    <p
                      style={{
                        ...responseItemStyle,
                        transition: 'background-color 0.3s ease',
                      }}
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
                      <hr style={replyDivider} />
                    )}
                  </div>
                ))
              ) : (
                <p
                  style={{
                    ...responseItemStyle,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  No response available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const spinnerStyle = `
.spinner {
  border: 3px solid rgba(255, 0, 0, 0.3);
  border-radius: 50%;
  border-top: 3px solid #87150b;
  width: 25px;
  height: 25px;
  animation: spin 1s linear infinite;
  margin: 9em auto;
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

export default EmailSuggestions;
