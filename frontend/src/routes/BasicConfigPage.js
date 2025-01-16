import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function BasicConfig() {
  const navigate = useNavigate();

  const [govMode, setGovMode] = useState('basic_happiness');
  const [colValue, setColValue] = useState(7.0);
  const [episodeLen, setEpisodeLen] = useState(60);
  const [showAdvancedTooltip, setShowAdvancedTooltip] = useState(false);

  const govOptions = [
    { key: 'basic_happiness', label: 'Happiness', description: 'Prioritizes household happiness' },
    { key: 'growth', label: 'Growth', description: 'Prioritizes population growth' },
    { key: 'strict_budget', label: 'Budget', description: 'Heavy penalty on deficits' },
    { key: 'dark_lord', label: 'Dark Emperor', description: 'Hates happiness, loves chaos and evil' },
  ];

  const handleGovSelection = (mode) => {
    setGovMode(mode);
  };

  const handleRunSimulation = () => {
    const config = {
      reward_mode: govMode,
      household_cost_of_living: colValue,
      episode_length: episodeLen,
    };
    navigate('/loading', { state: { userConfig: config } });
  };

  const handleAdvanced = () => {
    const partialConfig = {
      reward_mode: govMode,
      household_cost_of_living: colValue,
      episode_length: episodeLen,
    };
    localStorage.setItem('simulationConfig', JSON.stringify(partialConfig));
    navigate('/advanced');
  };

  return (
    <div className="page-container">
      <h2 className="mb-2">Basic Configuration</h2>

      <div className="panel mb-2">
        <p className="mb-1">Choose your government approach:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {govOptions.map((gov) => (
            <div
              key={gov.key}
              onClick={() => handleGovSelection(gov.key)}
              className="clickable"
              style={{
                border: govMode === gov.key ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{gov.label}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
                {gov.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel mb-2">
        <label className="mb-1" style={{ display: 'block' }}>
          Cost of Living: {colValue.toFixed(1)}
        </label>
        <input
          type="range"
          min={5}
          max={9}
          step={0.5}
          value={colValue}
          onChange={(e) => setColValue(parseFloat(e.target.value))}
        />
      </div>

      <div className="panel">
        <label className="mb-1" style={{ display: 'block' }}>
          Episode Length: {episodeLen}
        </label>
        <input
          type="range"
          min={40}
          max={80}
          step={1}
          value={episodeLen}
          onChange={(e) => setEpisodeLen(parseInt(e.target.value))}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleAdvanced}
            onMouseEnter={() => setShowAdvancedTooltip(true)}
            onMouseLeave={() => setShowAdvancedTooltip(false)}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--accent-color)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Advanced Configuration
          </button>

          {showAdvancedTooltip && (
            <div
              style={{
                position: 'absolute',
                marginTop: '0.5rem',
                backgroundColor: '#333',
                color: '#fff',
                padding: '0.7rem',
                borderRadius: '4px',
                width: '220px',
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            >
              For more advanced users looking for more city customization options
            </div>
          )}
        </div>

        <button
          onClick={handleRunSimulation}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--accent-color)',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
}

export default BasicConfig;
