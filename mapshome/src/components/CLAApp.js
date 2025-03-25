import React, { useState } from 'react';
import "./../assets/CLAApp.css";

const CLAApp = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [checkStatus, setCheckStatus] = useState('');

  const handleSign = async () => {
    setStatus('');
    try {
      const res = await fetch('https://atozmap.com/api/cla-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      setStatus(data.message || data.error);
    } catch (err) {
      setStatus('Error signing CLA');
    }
  };

  const handleCheck = async () => {
    setCheckStatus('');
    try {
      const res = await fetch('https://atozmap.com/api/check-cla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      setCheckStatus(data.signed ? '✅ User has signed the CLA' : '❌ User has NOT signed the CLA');
    } catch (err) {
      setCheckStatus('Error checking CLA status');
    }
  };

  return (
    <div className="cls-container">
      <h1>CLA Signing Portal</h1>
      <input
        type="text"
        placeholder="Enter GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="buttons">
        <button onClick={handleSign}>Sign CLA</button>
        <button onClick={handleCheck}>Check CLA</button>
      </div>
      {status && <p className="status">{status}</p>}
      {checkStatus && <p className="check-status">{checkStatus}</p>}
    </div>
  );
};

export default CLAApp;
