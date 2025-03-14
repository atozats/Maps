import React, { useState } from 'react';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('✅ Feedback sent successfully! Check your email for confirmation.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('❌ Error sending feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('⚠️ Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f4f9',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    feedbackContainer: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '450px',
      width: '100%',
    },
    heading: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '1.5rem',
      fontSize: '1.8rem',
      fontWeight: 'bold',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '0.8rem',
      fontWeight: 'bold',
      color: '#555',
      display: 'block',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginTop: '5px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      color: '#333',
      transition: 'border 0.3s ease-in-out',
    },
    inputFocus: {
      borderColor: '#007bff',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      marginTop: '5px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      color: '#333',
      resize: 'vertical',
      minHeight: '120px',
      transition: 'border 0.3s ease-in-out',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease-in-out',
      marginTop: '10px',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
    statusMessage: {
      textAlign: 'center',
      marginTop: '1rem',
      fontSize: '0.9rem',
      color: '#333',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.feedbackContainer}>
        <h2 style={styles.heading}>We Value Your Feedback</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '1rem' }}>
          Your thoughts help us improve. Please share your feedback below.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name Input */}
          <label style={styles.label}>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </label>

          {/* Email Input */}
          <label style={styles.label}>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </label>

          {/* Message Input */}
          <label style={styles.label}>
            Message:
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              style={styles.textarea}
              onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            ></textarea>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              backgroundColor: loading ? '#ccc' : styles.button.backgroundColor,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = styles.button.backgroundColor)}
          >
            {loading ? 'Sending...' : 'Submit Feedback'}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p style={styles.statusMessage}>
            {status.includes('✅') ? <span style={{ color: 'green' }}>{status}</span> : <span style={{ color: 'red' }}>{status}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
