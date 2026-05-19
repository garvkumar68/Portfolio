import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Intercept development hot module replacement websocket to prevent connection spam
if (process.env.NODE_ENV === 'development') {
  const OriginalWebSocket = window.WebSocket;
  class MockWebSocket {
    constructor(url, protocols) {
      this.url = url;
      this.protocols = protocols;
      this.readyState = 3; // CLOSED
      this.onopen = null;
      this.onclose = null;
      this.onmessage = null;
      this.onerror = null;
    }
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  }

  window.WebSocket = function (url, protocols) {
    if (typeof url === 'string' && url.includes('/ws')) {
      return new MockWebSocket(url, protocols);
    }
    return new OriginalWebSocket(url, protocols);
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
