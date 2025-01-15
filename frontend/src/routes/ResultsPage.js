import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import ChartHappiness from "../components/ChartHappiness";
import ChartBudget from "../components/ChartBudget";
import ChartPopulation from "../components/ChartPopulation";
import ChartProfit from "../components/ChartProfit";

function getModeDisplayName(modeKey) {
  const modeMap = {
    basic_happiness: "Happiness",
    growth: "Growth",
    strict_budget: "Budget",
    dark_lord: "Dark Emperor",
    custom: "Custom RL",
  };
  return modeMap[modeKey] || "Unknown Mode";
}

function SimulationSummaryPanel({
  initialHappiness,
  finalHappiness,
  initialPopulation,
  finalPopulation,
  initialBudget,
  finalBudget,
  finalProfit,
}) {
  return (
    <div className="panel" style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Simulation Summary</h2>
      <ul
        style={{
          listStyle: "none",
          paddingLeft: 0,
          fontSize: "1.05rem",
          lineHeight: "1.4",
        }}
      >
        <li>
          <strong>Avg. Household Happiness:</strong>{" "}
          {initialHappiness.toFixed(2)}{" "}
          <span style={{ color: "#aaa" }}>⇒</span> {finalHappiness.toFixed(2)}
        </li>
        <li>
          <strong>Population:</strong> {initialPopulation}{" "}
          <span style={{ color: "#aaa" }}>⇒</span> {finalPopulation}
        </li>
        <li>
          <strong>City Budget:</strong> {initialBudget.toFixed(2)}{" "}
          <span style={{ color: "#aaa" }}>⇒</span> {finalBudget.toFixed(2)}
        </li>
        <li>
          <strong>Final Profit:</strong> {finalProfit.toFixed(2)}
        </li>
      </ul>
    </div>
  );
}

function AdditionalStatsPanel({
  peakBudget,
  lowestBudget,
  peakHappiness,
  avgLeftover,
  peakProfit,
}) {
  return (
    <div className="panel" style={{ marginBottom: "2rem", fontSize: "0.95rem" }}>
      <h4 className="mb-1">Additional Stats</h4>
      <ul
        style={{
          listStyle: "none",
          paddingLeft: 0,
          lineHeight: "1.4",
        }}
      >
        <li>
          <strong>Peak Budget:</strong> {peakBudget.toFixed(2)}
        </li>
        <li>
          <strong>Lowest Budget:</strong> {lowestBudget.toFixed(2)}
        </li>
        <li>
          <strong>Peak Avg. Happiness:</strong> {peakHappiness.toFixed(2)}
        </li>
        <li>
          <strong>Average Leftover:</strong> {avgLeftover.toFixed(2)}
        </li>
        <li>
          <strong>Peak Daily Profit:</strong> {peakProfit.toFixed(2)}
        </li>
      </ul>
    </div>
  );
}

function PolicySummaryPanel({ debugSteps, chosenMode }) { 
  if (!debugSteps || debugSteps.length === 0) {
    return (
      <div className="panel" style={{ marginTop: "2rem" }}>
        <h3>Government Policy</h3>
        <p style={{ fontSize: "0.95rem" }}>No debug data available.</p>
      </div>
    );
  }

  let sumTax = 0;
  let sumInfra = 0;
  let sumSubsidy = 0;

  debugSteps.forEach((step) => {
    sumTax += step.chosen_tax || 0;
    sumInfra += step.chosen_infra || 0;
    sumSubsidy += step.chosen_subsidy || 0;
  });

  const count = debugSteps.length;
  const avgTax = sumTax / count;
  const avgInfra = sumInfra / count;
  const avgSubsidy = sumSubsidy / count;

  const lastStep = debugSteps[debugSteps.length - 1];
  const finalTax = (lastStep.chosen_tax || 0).toFixed(3);
  const finalInfra = (lastStep.chosen_infra || 0).toFixed(3);
  const finalSubsidy = (lastStep.chosen_subsidy || 0).toFixed(3);

  const displayMode = getModeDisplayName(chosenMode);

  return (
    <div className="panel" style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>Government Policy</h3>
      <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>
        <strong>Chosen Mode:</strong> {displayMode}
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.95rem",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #555" }}>
            <th
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "left",
              }}
            >
              Parameter
            </th>
            <th
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              Avg
            </th>
            <th
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              Final
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #444" }}>
            <td style={{ padding: "0.5rem 0.75rem" }}>Tax Rate</td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {avgTax.toFixed(3)}
            </td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {finalTax}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #444" }}>
            <td style={{ padding: "0.5rem 0.75rem" }}>
              Infrastructure Budget Fraction
            </td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {avgInfra.toFixed(3)}
            </td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {finalInfra}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #444" }}>
            <td style={{ padding: "0.5rem 0.75rem" }}>
              Subsidy Budget Fraction
            </td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {avgSubsidy.toFixed(3)}
            </td>
            <td
              style={{
                padding: "0.5rem 0.75rem",
                textAlign: "right",
              }}
            >
              {finalSubsidy}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function NotableEventsPanel({ debugSteps }) {
  if (!debugSteps || debugSteps.length === 0) {
    return (
      <div className="panel" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
        <h4>Notable Events</h4>
        <p>No debug steps found.</p>
      </div>
    );
  }

  const events = [];
  debugSteps.forEach((step, i) => {
    const day = i + 1;
    if (step.shock_triggered) {
      events.push(`Day ${day}: A shock was triggered.`);
    }
    if (step.bankrupt_count && step.bankrupt_count > 0) {
      events.push(`Day ${day}: ${step.bankrupt_count} firm(s) went bankrupt.`);
    }
  });

  if (events.length === 0) {
    return (
      <div className="panel" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
        <h4>Notable Events</h4>
        <p>No major events (no shocks or bankruptcies).</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
      <h4>Notable Events</h4>
      <ul style={{ paddingLeft: "1.3rem", lineHeight: "1.4" }}>
        {events.map((ev, idx) => (
          <li key={idx}>{ev}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const simData = location.state?.simData;

  if (!simData || !simData.time_steps) {
    return (
      <div style={{ padding: "1rem" }}>
        <h1>No simulation data available</h1>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>
    );
  }

  const {
    time_steps,
    happiness_series,
    budget_series,
    population_series,
    profit_series,
    leftover_spend_series,
    final_stats,
    debug_steps,
    chosen_gov_mode,
  } = simData;

  const debugSteps = debug_steps || [];

  const initialHappiness = happiness_series?.[0] || 0;
  const finalHappiness = final_stats?.final_happiness || 0;

  const initialPopulation = population_series?.[0] || 0;
  const finalPopulation = final_stats?.final_population || 0;

  const initialBudget = budget_series?.[0] || 0;
  const finalBudget = final_stats?.final_budget || 0;

  const finalProfit = profit_series?.[profit_series.length - 1] || 0;

  const peakBudget = Math.max(...budget_series);
  const lowestBudget = Math.min(...budget_series);
  const peakHappiness = Math.max(...happiness_series);

  let avgLeftover = 0;
  if (leftover_spend_series && leftover_spend_series.length > 0) {
    const sumLeftover = leftover_spend_series.reduce(
      (acc, val) => acc + val,
      0
    );
    avgLeftover = sumLeftover / leftover_spend_series.length;
  }
  const peakProfit = Math.max(...profit_series);

  return (
    <div className="page-container">
      <h1 style={{ marginBottom: "1rem" }}>Simulation Results</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>

      <SimulationSummaryPanel
        initialHappiness={initialHappiness}
        finalHappiness={finalHappiness}
        initialPopulation={initialPopulation}
        finalPopulation={finalPopulation}
        initialBudget={initialBudget}
        finalBudget={finalBudget}
        finalProfit={finalProfit}
      />

      <AdditionalStatsPanel
        peakBudget={peakBudget}
        lowestBudget={lowestBudget}
        peakHappiness={peakHappiness}
        avgLeftover={avgLeftover}
        peakProfit={peakProfit}
      />

      <div className="charts-grid" style={{ marginBottom: "2rem" }}>
        <div className="panel">
          <ChartHappiness
            data={{ time_steps, happiness_series }}
            title="Average Household Happiness Over Time"
          />
        </div>
        <div className="panel">
          <ChartBudget
            data={{ time_steps, budget_series }}
            title="City Budget Over Time"
          />
        </div>
        <div className="panel">
          <ChartPopulation
            data={{ time_steps, population_series }}
            title="City Population Over Time"
          />
        </div>
        <div className="panel">
          <ChartProfit
            data={{ time_steps, profit_series }}
            title="Firm Profit Over Time"
          />
        </div>
      </div>

      <PolicySummaryPanel
        debugSteps={debugSteps}
        chosenMode={chosen_gov_mode || final_stats?.chosen_gov_mode || "unknown"}
      />

      <NotableEventsPanel debugSteps={debugSteps} />
    </div>
  );
}
