import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function AdvancedConfig() {
  const navigate = useNavigate();

  const [govMode, setGovMode] = useState('basic_happiness');
  const [colValue, setColValue] = useState(7.0);
  const [episodeLen, setEpisodeLen] = useState(60);
  const [shockProb, setShockProb] = useState(0.0);
  const [inflation, setInflation] = useState(0.0);
  const [demandSens, setDemandSens] = useState(0.35);
  const [wageMin, setWageMin] = useState(13);
  const [deficitWeight, setDeficitWeight] = useState(0.0);
  const [hapWeight, setHapWeight] = useState(1.0);
  const [popWeight, setPopWeight] = useState(0.0);
  const [infraWeight, setInfraWeight] = useState(0.0);
  const [profitWeight, setProfitWeight] = useState(0.0);
  const [hasCustomDefaultsBeenSet, setHasCustomDefaultsBeenSet] = useState(false);

  function resetCustomSliders() {
    setDeficitWeight(1.0);
    setHapWeight(1.5);
    setPopWeight(0.5);
    setInfraWeight(0.2);
    setProfitWeight(0.8);
    setHasCustomDefaultsBeenSet(true);
  }

  useEffect(() => {
    const stored = localStorage.getItem('simulationConfig');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.reward_mode) {
        setGovMode(parsed.reward_mode);
      }
      if (parsed.household_cost_of_living != null) {
        setColValue(parsed.household_cost_of_living);
      }
      if (parsed.episode_length != null) {
        setEpisodeLen(parsed.episode_length);
      }
      if (parsed.custom_weights && parsed.reward_mode === 'custom') {
        setDeficitWeight(parsed.custom_weights.deficit ?? 1.0);
        setHapWeight(parsed.custom_weights.hap ?? 1.0);
        setPopWeight(parsed.custom_weights.pop ?? 0.0);
        setInfraWeight(parsed.custom_weights.infra ?? 0.0);
        setProfitWeight(parsed.custom_weights.profit ?? 0.0);
        setHasCustomDefaultsBeenSet(true);
      }
    }
  }, []);

  const builtInModes = [
    { key: 'basic_happiness', label: 'Happiness', description: 'Prioritizes household happiness' },
    { key: 'growth', label: 'Growth', description: 'Prioritizes population growth' },
    { key: 'strict_budget', label: 'Budget', description: 'Heavy penalty on deficits' },
    { key: 'dark_lord', label: 'Dark Emperor', description: 'Hates happiness, loves chaos and evil' },
  ];

  const customMode = {
    key: 'custom',
    label: 'Custom',
    description: 'Define your own RL reward function',
  };

  const handleGovSelection = (mode) => {
    setGovMode(mode);
    if (mode === 'custom' && !hasCustomDefaultsBeenSet) {
      resetCustomSliders();
    }
  };

  const handleBackToBasic = () => {
    navigate('/config');
  };

  const handleRunSimulation = () => {
    const finalConfig = {
      reward_mode: govMode,
      household_cost_of_living: colValue,
      episode_length: episodeLen,
      shock_probability: shockProb,
      inflation_rate: inflation,
      demand_sensitivity: demandSens,
      household_wage_min: wageMin,
    };

    if (govMode === 'custom') {
      finalConfig.custom_weights = {
        deficit: deficitWeight,
        hap: hapWeight,
        pop: popWeight,
        infra: infraWeight,
        profit: profitWeight,
      };
    }

    navigate('/loading', { state: { userConfig: finalConfig } });
  };

  return (
    <div className="page-container">
      <h2 className="mb-2">Advanced Configuration</h2>
      <button onClick={handleBackToBasic} style={{ marginBottom: '1rem' }}>
        ← Back to Basic
      </button>
      <div className="panel">
        <p style={{ marginBottom: '0.5rem' }}>Choose your government approach:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {builtInModes.map((gov) => (
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
              <h3 style={{ marginBottom: '0.5rem' }}>{gov.label}</h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>{gov.description}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            onClick={() => handleGovSelection(customMode.key)}
            className="clickable"
            style={{
              border: govMode === customMode.key ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: '8px',
              width: '280px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <h3 style={{ marginBottom: '0.5rem' }}>{customMode.label}</h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>{customMode.description}</p>
            {govMode === 'custom' && (
              <div
                style={{
                  marginTop: '0.75rem',
                  backgroundColor: '#2a2a2a',
                  padding: '0.75rem',
                  borderRadius: '6px',
                }}
              >
                <h5 style={{ marginBottom: '0.5rem' }}>Custom RL Weights</h5>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Happiness: {hapWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={hapWeight}
                  onChange={(e) => setHapWeight(parseFloat(e.target.value))}
                />
                <label style={{ display: 'block', margin: '0.75rem 0 0.25rem 0' }}>
                  Population: {popWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={popWeight}
                  onChange={(e) => setPopWeight(parseFloat(e.target.value))}
                />
                <label style={{ display: 'block', margin: '0.75rem 0 0.25rem 0' }}>
                  Infrastructure: {infraWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={infraWeight}
                  onChange={(e) => setInfraWeight(parseFloat(e.target.value))}
                />
                <label style={{ display: 'block', margin: '0.75rem 0 0.25rem 0' }}>
                  Profit: {profitWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={profitWeight}
                  onChange={(e) => setProfitWeight(parseFloat(e.target.value))}
                />
                <label style={{ display: 'block', margin: '0.75rem 0 0.25rem 0' }}>
                  Deficit: {deficitWeight.toFixed(1)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={deficitWeight}
                  onChange={(e) => setDeficitWeight(parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Cost of Living: {colValue.toFixed(1)}
        </label>
        <input
          type="range"
          min={5}
          max={12}
          step={0.5}
          value={colValue}
          onChange={(e) => setColValue(parseFloat(e.target.value))}
        />
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Episode Length: {episodeLen}
        </label>
        <input
          type="range"
          min={30}
          max={100}
          step={1}
          value={episodeLen}
          onChange={(e) => setEpisodeLen(parseInt(e.target.value))}
        />
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Shock Probability: {shockProb.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={0.3}
          step={0.01}
          value={shockProb}
          onChange={(e) => setShockProb(parseFloat(e.target.value))}
        />
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Inflation Rate: {inflation.toFixed(2)}
        </label>
        <input
          type="range"
          min={0}
          max={0.1}
          step={0.01}
          value={inflation}
          onChange={(e) => setInflation(parseFloat(e.target.value))}
        />
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Demand Sensitivity: {demandSens.toFixed(2)}
        </label>
        <input
          type="range"
          min={0.1}
          max={0.5}
          step={0.01}
          value={demandSens}
          onChange={(e) => setDemandSens(parseFloat(e.target.value))}
        />
      </div>
      <div className="panel">
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Household Min Wage: {wageMin}
        </label>
        <input
          type="range"
          min={5}
          max={15}
          step={1}
          value={wageMin}
          onChange={(e) => setWageMin(parseInt(e.target.value))}
        />
      </div>
      <button onClick={handleRunSimulation} style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}>
        Run Simulation
      </button>
    </div>
  );
}

export default AdvancedConfig;
