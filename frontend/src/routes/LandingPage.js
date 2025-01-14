import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [hoverGitHub, setHoverGitHub] = React.useState(false);
  const [hoverStart, setHoverStart] = React.useState(false);

  const githubNormalColor = "#1a2a58";
  const githubHoverColor = "#2a3a78";
  const startNormalColor = "#26a69a";
  const startHoverColor = "#2ebca8";

  const handleStart = () => {
    navigate('/config');
  };

  return (
    <div
      className="landing-container"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem 3rem',
        color: '#fff',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
        Reinforcement Learning City Simulator
      </h1>
      <p
        style={{
          maxWidth: '700px',
          margin: '0 auto 2.5rem auto',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        Explore the effects of RL-powered policy decisions in a customizable city simulation
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
          margin: '0 auto 2.5rem auto',
          maxWidth: '1000px',
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ ...cardHeadingStyle, textAlign: 'center' }}>Households</h3>
          <p style={cardParagraphStyle}>
            The city is populated with 50 households. Each household has:
          </p>
          <ul style={cardListStyle}>
            <li>An employment status and an income if employed.</li>
            <li>A cost of living covering basic daily expenses.</li>
            <li>A happiness level between 0 and 100.</li>
          </ul>
        </div>
        <div style={cardStyle}>
          <h3 style={{ ...cardHeadingStyle, textAlign: 'center' }}>Firms</h3>
          <p style={cardParagraphStyle}>
            The city has a chain of 3 firms powering the local economy:
          </p>
          <ul style={cardListStyle}>
            <li>Raw Material Firm: Produces the base resource.</li>
            <li>Manufacturer Firm: Turns raw materials into finished goods.</li>
            <li>Retail Firm: Sells finished goods to households.</li>
          </ul>
        </div>
        <div style={cardStyle}>
          <h3 style={{ ...cardHeadingStyle, textAlign: 'center' }}>RL Government Agent</h3>
          <p style={cardParagraphStyle}>
            Oversees the city by adjusting daily policy levers:
          </p>
          <ul style={cardListStyle}>
            <li>Tax Rate: Money collected from households/firms.</li>
            <li>Infrastructure Investment: Budget for city improvements.</li>
            <li>Subsidies: Transferable funds to households aiming to increase wellbeing.</li>
          </ul>
        </div>
      </div>

      <div style={flowSectionStyle}>
        <div style={flowBoxStyle}>
          <strong>1</strong>
          <p style={flowTextStyle}>Set City Configuration</p>
        </div>
        <div style={flowArrowStyle}>→</div>
        <div style={flowBoxStyle}>
          <strong>2</strong>
          <p style={flowTextStyle}>Train Gov Agent &amp; Run Simulation</p>
        </div>
        <div style={flowArrowStyle}>→</div>
        <div style={flowBoxStyle}>
          <strong>3</strong>
          <p style={flowTextStyle}>See Results &amp; Analytics Page</p>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <a
          href="https://github.com/bencoleman24/Reinforcement-Learning-City-Simulation"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: hoverGitHub ? githubHoverColor : githubNormalColor,
            color: '#fff',
            fontSize: '0.9rem',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={() => setHoverGitHub(true)}
          onMouseLeave={() => setHoverGitHub(false)}
        >
          GitHub Repo
        </a>
        <button
          onClick={handleStart}
          style={{
            fontSize: '1.2rem',
            padding: '1rem 2.5rem',
            borderRadius: '6px',
            backgroundColor: hoverStart ? startHoverColor : startNormalColor,
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={() => setHoverStart(true)}
          onMouseLeave={() => setHoverStart(false)}
        >
          Get Started
        </button>
      </div>

      <div
        style={{
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#bbb',
          textAlign: 'center',
        }}
      >
        Created by <strong>Ben Coleman</strong>
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#2a2a2a',
  padding: '1.5rem',
  borderRadius: '8px',
  textAlign: 'left',
  minHeight: '160px',
};

const cardHeadingStyle = {
  marginBottom: '0.5rem',
  fontSize: '1.1rem',
};

const cardParagraphStyle = {
  margin: 0,
  lineHeight: '1.4',
  fontSize: '0.95rem',
  marginBottom: '0.5rem',
};

const cardListStyle = {
  margin: 0,
  paddingLeft: '1.3rem',
  lineHeight: '1.6',
  listStyle: 'disc',
};

const flowSectionStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '3rem',
  flexWrap: 'wrap',
};

const flowBoxStyle = {
  background: '#333',
  borderRadius: '8px',
  padding: '1rem',
  minWidth: '200px',
  textAlign: 'center',
};

const flowTextStyle = {
  margin: '0.4rem 0 0 0',
  fontSize: '1rem',
  lineHeight: '1.4',
};

const flowArrowStyle = {
  fontSize: '1.5rem',
  color: '#ccc',
};

export default LandingPage;
