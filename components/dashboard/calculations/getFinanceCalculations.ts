import { FINANCE_BUCKETS } from "@/lib/constants";

export const getFinanceCalculations = (
  finance: any[] = [],
  expensesSummaryData: any,
) => {

  const getBucketValue = (
    bucket: string[],
    field: "cv" | "ms" = "cv",
  ) =>
    finance
      .filter((item) => bucket.includes(item?.c?.n))
      .reduce(
        (sum, item) =>
          sum + Number(item?.[field] ?? 0),
        0,
      );

  /* ---------------- Assets ---------------- */

  const totalAssestsValue =
    getBucketValue(FINANCE_BUCKETS.ASSETS_BUCKET);

  const totalLiabilitiesValue =
    getBucketValue(FINANCE_BUCKETS.LIABILITY_BUCKET);

  const networthValue =
    totalAssestsValue -
    totalLiabilitiesValue;

  const debtToAssetRatio =
    totalAssestsValue
      ? (totalLiabilitiesValue / totalAssestsValue) * 100
      : 0;

  /* ---------------- Investments ---------------- */

  const investmentsValue =
    getBucketValue(
      FINANCE_BUCKETS.INVESTMENTS_BUCKET,
    );

  const liquidAssetsValue =
    getBucketValue(
      FINANCE_BUCKETS.LIQUID_ASSETS_BUCKET,
    );

  const retirementCorpus =
    getBucketValue(
      FINANCE_BUCKETS.RETIREMENT_BUCKET,
    );

  const insuranceValue =
    getBucketValue(
      FINANCE_BUCKETS.INSURANCE_BUCKET,
    );

  const goalsValue =
    getBucketValue(
      FINANCE_BUCKETS.GOALS_BUCKET,
    );

  const monthlyCommitments =
    getBucketValue(
      FINANCE_BUCKETS.COMMITMENTS_BUCKET,
    );

  /* ---------------- Expenses ---------------- */

  const thisMonthExpenses =
    Number(
      expensesSummaryData?.selectedMonthExpenseValue,
    ) || 0;

  const emergencyMonths =
    thisMonthExpenses > 0
      ? liquidAssetsValue /
        thisMonthExpenses
      : 0;

  /* ---------------- Allocation ---------------- */

  const investmentAllocation =
    totalAssestsValue
      ? (investmentsValue /
          totalAssestsValue) *
        100
      : 0;

  const retirementAllocation =
    totalAssestsValue
      ? (retirementCorpus /
          totalAssestsValue) *
        100
      : 0;

  const insuranceAllocation =
    totalAssestsValue
      ? (insuranceValue /
          totalAssestsValue) *
        100
      : 0;

  const goalAllocation =
    totalAssestsValue
      ? (goalsValue /
          totalAssestsValue) *
        100
      : 0;

  /* ---------------- Financial Freedom ---------------- */

  let score = 0;

  // Net Worth
  if (networthValue > 0) score += 15;

  // Debt
  if (debtToAssetRatio <= 10) score += 15;
  else if (debtToAssetRatio <= 20) score += 12;
  else if (debtToAssetRatio <= 30) score += 9;
  else if (debtToAssetRatio <= 50) score += 5;

  // Investment Allocation
  if (investmentAllocation >= 60) score += 15;
  else if (investmentAllocation >= 40) score += 12;
  else if (investmentAllocation >= 25) score += 8;
  else if (investmentAllocation >= 10) score += 4;

  // Liquidity
  const liquidityRatio =
    totalAssestsValue
      ? (liquidAssetsValue /
          totalAssestsValue) *
        100
      : 0;

  if (
    liquidityRatio >= 10 &&
    liquidityRatio <= 30
  )
    score += 10;
  else if (liquidityRatio >= 5)
    score += 7;
  else if (liquidityRatio > 0)
    score += 4;

  // Emergency Fund

  if (emergencyMonths >= 12)
    score += 10;
  else if (emergencyMonths >= 9)
    score += 9;
  else if (emergencyMonths >= 6)
    score += 8;
  else if (emergencyMonths >= 3)
    score += 5;
  else if (emergencyMonths >= 1)
    score += 2;

  // Retirement

  if (retirementAllocation >= 20)
    score += 10;
  else if (retirementAllocation >= 15)
    score += 8;
  else if (retirementAllocation >= 10)
    score += 6;
  else if (retirementAllocation >= 5)
    score += 3;

  // Insurance

  const hasLife =
    finance.some(
      (x) => x?.c?.n === "LIFE I",
    );

  const hasHealth =
    finance.some(
      (x) => x?.c?.n === "HEALTH I",
    );

  const hasTerm =
    finance.some(
      (x) => x?.c?.n === "TERM I",
    );

  if (
    hasLife &&
    hasHealth &&
    hasTerm
  )
    score += 10;
  else if (hasLife && hasHealth)
    score += 8;
  else if (hasLife || hasHealth)
    score += 5;

  // Goal Planning

  if (goalsValue > 0)
    score += 5;

  // Diversification

  let diversification = 0;

  if (investmentsValue > 0)
    diversification++;

  if (retirementCorpus > 0)
    diversification++;

  if (liquidAssetsValue > 0)
    diversification++;

  if (
    finance.some((x) =>
      FINANCE_BUCKETS.REAL_ASSETS_BUCKET.includes(
        x?.c?.n,
      ),
    )
  )
    diversification++;

  if (
    finance.some((x) =>
      FINANCE_BUCKETS.RECEIVABLES_BUCKET.includes(
        x?.c?.n,
      ),
    )
  )
    diversification++;

  score += Math.min(
    diversification,
    5,
  );

  // Cash Flow

  if (
    thisMonthExpenses >
    monthlyCommitments
  )
    score += 5;
  else if (thisMonthExpenses > 0)
    score += 3;

  const financialFreedomScore =
    Math.min(
      100,
      Math.round(score),
    );

  return {
    networthValue,
    totalAssestsValue,
    totalLiabilitiesValue,
    debtToAssetRatio,

    investmentsValue,
    liquidAssetsValue,

    emergencyMonths,

    retirementCorpus,
    insuranceValue,
    goalsValue,

    monthlyCommitments,

    investmentAllocation,
    retirementAllocation,
    insuranceAllocation,
    goalAllocation,

    financialFreedomScore,
  };
};