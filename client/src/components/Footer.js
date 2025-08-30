import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo" aria-label="App footer">
      <div className="footer-left">
        <div className="fb-title">🛠️ Website Feedback</div>
        <div className="fb-line">Found a bug or issue? Help us improve.</div>
        <div className="fb-line">
          <strong>📧 Report issues:</strong>{" "}
          <a className="email" href="mailto:support@mindease.com">
            support@mindease.com
          </a>
        </div>
        <div className="fb-meta">
          © 2025 MindEase. Built with care, powered by empathy.
        </div>
      </div>

      <div className="footer-center">
        <p className="tagline">
          “You are not alone. MindEase stands with you through every chapter of
          your mental health story because every step matters.”
        </p>
      </div>
    </footer>
  );
}
