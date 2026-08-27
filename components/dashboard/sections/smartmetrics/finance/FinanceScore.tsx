import { FinanceScore } from "@/components/dashboard/calculations/getFinanceCalculations";
import "./financeMetrics.css";

export const FinanceScoreCard = ({
  financeScore,
}: {
  financeScore: FinanceScore;
}) => {
  console.log(financeScore, "financeScore");
  const scorePercentage =
    financeScore.maxScore > 0
      ? (financeScore.score / financeScore.maxScore) * 100
      : 0;

  const score = Math.round(financeScore.score);

  const getScoreMessage = () => {
    if (score >= 85) {
      return {
        title: "Excellent wealth-building position",
        description:
          "Your current financial structure is strongly positioned for long-term wealth creation.",
        icon: "🚀",
      };
    }

    if (score >= 70) {
      return {
        title: "Strong foundation — accelerate",
        description:
          "Your finances are healthy, but increasing capital deployment and income growth can materially improve your wealth trajectory.",
        icon: "📈",
      };
    }

    if (score >= 50) {
      return {
        title: "Good foundation — growth is the priority",
        description:
          "You have a base to build on, but your current capital creation rate needs to increase.",
        icon: "⚡",
      };
    }

    return {
      title: "Wealth creation needs attention",
      description:
        "Your current financial structure may protect wealth, but it is not yet optimized for aggressive long-term wealth creation.",
      icon: "⚠️",
    };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="chart-card wealth-builder-card">
      {/* Header */}
      <div className="finance-card-heading">
        <div>
          <h3>🚀 Wealth Builder Score</h3>
        </div>

        <span className="finance-status-pill success">
          {financeScore.label}
        </span>
      </div>

      {/* Main Score */}
      <div className="wealth-score-hero">
        <div
          className="wealth-score-circle"
          style={
            {
              "--score-progress": `${scorePercentage}%`,
            } as React.CSSProperties
          }
        >
          <div className="wealth-score-inner">
            <div className="wealth-score-number">
              {score}/{financeScore.maxScore}
            </div>
          </div>
        </div>

        <div className="wealth-score-summary">
          <strong>
            {scoreMessage.icon} {scoreMessage.title}
          </strong>

          <p>{scoreMessage.description}</p>
        </div>
      </div>

      {/* Highest Impact */}
      <div className="wealth-action-section">
        {financeScore.improvements.length === 0 ? (
          <div className="wealth-action-empty">
            <span>🟢</span>

            <div>
              <strong>No critical weakness detected</strong>

              <p>
                Your current financial structure is performing well. Focus on
                increasing income and productive capital deployment.
              </p>
            </div>
          </div>
        ) : (
          <div className="wealth-action-list">
            {financeScore.improvements.map((improvement, index) => {
              const priority =
                improvement.priority === "High"
                  ? "high"
                  : improvement.priority === "Medium"
                    ? "medium"
                    : "low";

              return (
                <div
                  className={`wealth-action-item ${priority}`}
                  key={`${improvement.title}-${index}`}
                >
                  <div className="wealth-action-priority">
                    {improvement.priority === "High"
                      ? "🔴"
                      : improvement.priority === "Medium"
                        ? "🟡"
                        : "🟢"}
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{improvement.title}</strong>
                    </div>

                    <p>{improvement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
