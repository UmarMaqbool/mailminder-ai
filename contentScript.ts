let iframeExists = false;

const addButtonToPage = () => {
  const mainDiv = document.querySelector('.amn');
  if (mainDiv && !document.getElementById('myInjectButton')) {
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.alignItems = 'center';
    const button = document.createElement('button');
    const logoImg = document.createElement('img');
    logoImg.src =
      'https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I';
    logoImg.style.width = '17px';
    logoImg.style.height = '17px';
    logoImg.style.marginRight = '5px';
    logoImg.style.borderRadius = '50%';
    button.id = 'myInjectButton';
    button.style.padding = '9.5px 16px';
    button.style.backgroundColor = 'transparent';
    button.style.color = '#87150b';
    button.style.border = '1px solid #87150b';
    button.style.borderRadius = '18px';
    button.style.fontWeight = '500';
    button.style.marginRight = '8px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '.875rem';
    const buttonText = document.createTextNode('EvolveBay');
    button.addEventListener('click', function () {
      chrome.runtime.sendMessage({ action: 'authenticateWithGoogle' });
      chrome.runtime.sendMessage({ action: 'executeOnClicker' });
    });

    const firstSpan = mainDiv.querySelector('span');
    if (firstSpan) {
      mainDiv.insertBefore(button, firstSpan);
    } else {
      console.log('Span not found');
    }
    contentWrapper.appendChild(logoImg);
    contentWrapper.appendChild(buttonText);
    button.appendChild(contentWrapper);
  }
};

const addButtonToReply = () => {
  const mainSmallDiv = document.querySelector('.J-J5-Ji.btA');
  if (mainSmallDiv && !document.getElementById('myInjectSmallButton')) {
    const button = document.createElement('img');
    button.src =
      'https://media.licdn.com/dms/image/D4D0BAQGd8H31h5niqg/company-logo_200_200/0/1712309492132/evolvebay_logo?e=2147483647&v=beta&t=tSYT6EkXf7aP709xw1DbPc41AbobGq6qtM5PC1El__I';
    button.alt = 'icon';
    button.id = 'myInjectSmallButton';
    button.style.width = '24px';
    button.style.height = '24px';
    button.style.borderRadius = '20px';
    button.style.marginLeft = '10px';
    button.style.marginRight = '2px';
    button.style.cursor = 'pointer';

    button.addEventListener('click', async function () {
      chrome.runtime.sendMessage({ action: 'authenticateWithGoogle' });
      iframeExists = false;
      if (!iframeExists) {
        chrome.runtime.sendMessage({ action: 'closeIframe' });
      }
    });

    const firstSpan = mainSmallDiv?.querySelector('span');
    if (firstSpan) {
      mainSmallDiv?.insertBefore(button, firstSpan);
    } else {
      mainSmallDiv?.appendChild(button);
    }
  }
};

function isGmailInbox(url: string): boolean {
  return (
    url.startsWith('https://mail.google.com/mail/u/') && url.includes('#inbox')
  );
}

function addInboxButtonIfRequired(url: string) {
  if (isGmailInbox(url)) {
    addButtonToPage();
  }
}

window.onload = function () {
  setTimeout(() => {
    addButtonToPage();
  }, 500);
};

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  if (
    target &&
    target.classList.contains('T-I-J3') &&
    target.classList.contains('og')
  ) {
    addButtonToPage();
  }
  if (
    target &&
    target.classList.contains('ams') &&
    target.classList.contains('bkH')
  ) {
    setTimeout(() => {
      addButtonToReply();
    }, 200);
  }
});

addInboxButtonIfRequired(window.location.href);

window.addEventListener('hashchange', () => {
  addInboxButtonIfRequired(window.location.href);
  const url = window.location.href;
  if (url.endsWith('#inbox')) {
    if (iframeExists) chrome.runtime.sendMessage({ action: 'closeIframe' });
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'clickReplyButton') {
    const replyButton = document.querySelector(
      '.ams.bkH'
    ) as HTMLElement | null;
    replyButton?.click();
    if (!iframeExists) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
            position: absolute;
            top: 11em; 
            left: 4em; 
            width: 550px; 
            height: 350px;
            border: none;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.1);
            border-radius: 17px;
            z-index: 999999;
            background-color: white;
          `;
      iframe.src = chrome.runtime.getURL('iframe.html');
      document.body.appendChild(iframe);
      iframeExists = true;

      const closeListener = (
        message: { action: string },
        sender: any,
        sendResponse: any
      ) => {
        if (message.action === 'closeIframe') {
          if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
            iframeExists = true;
          }
        }
      };
      chrome.runtime.onMessage.addListener(closeListener);
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'handleAuthToken') {
    const { token } = message;
    const messageElement = document.querySelector('[data-legacy-message-id]');
    if (messageElement) {
      const messageId = messageElement.getAttribute('data-legacy-message-id');
      chrome.runtime.sendMessage({
        action: 'getMessageDetails',
        messageId: messageId,
        accessToken: token,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'suggestedText') {
    const replyInput = document.querySelector(
      '.Am.aiL.aO9.Al.editable.LW-avf.tS-tW'
    );
    if (replyInput) {
      replyInput.textContent = message.suggestedText;
    } else {
      console.log('Reply input not found');
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'generateEmailText') {
    const emailText = message.emailText;
  }
});
