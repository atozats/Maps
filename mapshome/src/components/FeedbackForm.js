

import React, { useState } from "react";

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Sending...");

    try {
      const response = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus(`Thank you for your feedback. We have received the following message from you

Best regards,
The AtozMap Team`);
        setFormData({ name: "", phone: "", message: "" });
      } else {
        setStatus("❌ Error sending feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("⚠️ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f4f4f9",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      flexDirection: "column", // Align items vertically
    },
    feedbackContainer: {
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      maxWidth: "450px",
      width: "100%",
      marginBottom: "2rem", // Space between form and GitHub box
    },
    heading: {
      textAlign: "center",
      color: "#333",
      marginBottom: "1.5rem",
      fontSize: "1.8rem",
      fontWeight: "bold",
    },
    form: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      marginBottom: "0.8rem",
      fontWeight: "bold",
      color: "#555",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginTop: "5px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "1rem",
      color: "#333",
      transition: "border 0.3s ease-in-out",
    },
    inputFocus: {
      borderColor: "#007bff",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      marginTop: "5px",
      border: "1px solid #ddd",
      borderRadius: "6px",
      fontSize: "1rem",
      color: "#333",
      resize: "vertical",
      minHeight: "120px",
      transition: "border 0.3s ease-in-out",
    },
    button: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "12px",
      border: "none",
      borderRadius: "6px",
      fontSize: "1rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease-in-out",
      marginTop: "10px",
    },
    buttonHover: {
      backgroundColor: "#0056b3",
    },
    statusMessage: {
      textAlign: "center",
      marginTop: "1rem",
      fontSize: "0.9rem",
      color: "#333",
      whiteSpace: "pre-line",
    },
    githubBox: {
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      maxWidth: "450px",
      width: "100%",
      textAlign: "center",
    },
    quote: {
      fontStyle: "italic",
      color: "#666",
      marginBottom: "1.5rem",
      fontSize: "1rem",
    },
    githubLink: {
      color: "#007bff",
      textDecoration: "none",
      fontSize: "1.1rem",
      fontWeight: "600",
      transition: "all 0.3s ease-in-out",
      position: "relative",
      paddingBottom: "4px",
    },
    githubLinkHover: {
      color: "#0056b3",
    },
    githubLinkUnderline: {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "2px",
      backgroundColor: "#007bff",
      transform: "scaleX(0)",
      transformOrigin: "bottom right",
      transition: "transform 0.3s ease-in-out",
    },
    githubLinkHoverUnderline: {
      transform: "scaleX(1)",
      transformOrigin: "bottom left",
    },
  };

  return (
    <div style={styles.container}>
      {/* Feedback Form */}
      <div style={styles.feedbackContainer}>
        <h2 style={styles.heading}>We Value Your Feedback</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "1rem" }}>
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
              onFocus={(e) =>
                (e.target.style.borderColor = styles.inputFocus.borderColor)
              }
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
          </label>

          {/* Phone Input (replacing Email) */}
          <label style={styles.label}>
            Phone Number:
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) =>
                (e.target.style.borderColor = styles.inputFocus.borderColor)
              }
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
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
              onFocus={(e) =>
                (e.target.style.borderColor = styles.inputFocus.borderColor)
              }
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            ></textarea>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              backgroundColor: loading ? "#ccc" : styles.button.backgroundColor,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
            onMouseOver={(e) =>
              !loading &&
              (e.target.style.backgroundColor =
                styles.buttonHover.backgroundColor)
            }
            onMouseOut={(e) =>
              !loading &&
              (e.target.style.backgroundColor = styles.button.backgroundColor)
            }
          >
            {loading ? "Sending..." : "Submit Feedback"}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p style={styles.statusMessage}>
            {status.includes("❌") || status.includes("⚠️") ? (
              <span style={{ color: "red" }}>{status}</span>
            ) : (
              <span style={{ color: "green" }}>{status}</span>
            )}
          </p>
        )}
      </div>

      {/* GitHub Box */}
      <div style={styles.githubBox}>
        <p style={styles.quote}>
          "Great code is not just written; it's crafted with passion and
          collaboration."
        </p>
        <a
          href="https://github.com/atozats/Maps.git"
          style={styles.githubLink}
          onMouseOver={(e) => {
            e.target.style.color = styles.githubLinkHover.color;
            e.target.querySelector(".underline").style.transform =
              styles.githubLinkHoverUnderline.transform;
          }}
          onMouseOut={(e) => {
            e.target.style.color = styles.githubLink.color;
            e.target.querySelector(".underline").style.transform =
              styles.githubLinkUnderline.transform;
          }}
        >
          Join Us on GitHub
          <span className="underline" style={styles.githubLinkUnderline}></span>
        </a>
      </div>
    </div>
  );
};

export default FeedbackForm;
