import {
  FINANCE_BUCKETS,
} from '@/lib/constants';

import {
  ExpenseSummaryData,
  Finance,
} from '@/lib/types';

type FinanceValueField =
  | 'cv'
  | 'ms';

type FinanceItem = Finance & {
  c?: {
    n?: string;
  } | null;

  cv?: number | string | null;
  ms?: number | string | null;
};

export const getFinanceCalculations = (
  finance: Finance[] = [],
  expenseSummaryData:
    ExpenseSummaryData | null = null,
) => {

  // -----------------------------------
  // FINANCE HELPERS
  // -----------------------------------

  const getBucketValue = (
    bucket: readonly string[],
    field: FinanceValueField = 'cv',
  ): number => {

    return finance
      .filter((item) => {

        const category =
          item.c?.n;

        return (
          typeof category === 'string' &&
          bucket.includes(category)
        );
      })
      .reduce(
        (sum, item) => {

          const value =
            (item as FinanceItem)?.[field];

          return (
            sum +
            Number(value ?? 0)
          );
        },
        0,
      );
  };

  // -----------------------------------
  // ASSETS
  // -----------------------------------

  const totalAssetsValue =
    getBucketValue(
      FINANCE_BUCKETS.ASSETS_BUCKET,
    );

  const totalLiabilitiesValue =
    getBucketValue(
      FINANCE_BUCKETS.LIABILITY_BUCKET,
    );

  const networthValue =
    totalAssetsValue -
    totalLiabilitiesValue;

  const debtToAssetRatio =
    totalAssetsValue > 0
      ? (
          totalLiabilitiesValue /
          totalAssetsValue
        ) * 100
      : 0;

  // -----------------------------------
  // INVESTMENTS
  // -----------------------------------

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

  // -----------------------------------
  // EXPENSES
  // -----------------------------------

  const expenseSummaryCategories =
    Array.from(
      new Set(
        expenseSummaryData?.months?.flatMap(
          (month) =>
            month.c.map(
              (category) =>
                category.n,
            ),
        ) ?? [],
      ),
    );

  const getExpenseAmount = (
    month:
      ExpenseSummaryData['months'][number],
    category: string,
  ): number => {

    return (
      month.c.find(
        (item) =>
          item.n === category,
      )?.a ?? 0
    );
  };

  // -----------------------------------
  // EMERGENCY FUND
  // -----------------------------------

  const thisMonthExpenses =
    Number(
      expenseSummaryData
        ?.months
        ?.find(
          (month) =>
            month.m ===
            new Date().toLocaleString(
              'en-US',
              {
                month: 'long',
              },
            ),
        )?.t ?? 0,
    );

  const emergencyMonths =
    thisMonthExpenses > 0
      ? liquidAssetsValue /
        thisMonthExpenses
      : 0;

  // -----------------------------------
  // ALLOCATION
  // -----------------------------------

  const investmentAllocation =
    totalAssetsValue > 0
      ? (
          investmentsValue /
          totalAssetsValue
        ) * 100
      : 0;

  const retirementAllocation =
    totalAssetsValue > 0
      ? (
          retirementCorpus /
          totalAssetsValue
        ) * 100
      : 0;

  const insuranceAllocation =
    totalAssetsValue > 0
      ? (
          insuranceValue /
          totalAssetsValue
        ) * 100
      : 0;

  const goalAllocation =
    totalAssetsValue > 0
      ? (
          goalsValue /
          totalAssetsValue
        ) * 100
      : 0;

  // -----------------------------------
  // FINANCIAL FREEDOM SCORE
  // -----------------------------------

  let score = 0;

  // -----------------------------------
  // NET WORTH
  // -----------------------------------

  if (networthValue > 0) {
    score += 15;
  }

  // -----------------------------------
  // DEBT
  // -----------------------------------

  if (debtToAssetRatio <= 10) {
    score += 15;
  } else if (debtToAssetRatio <= 20) {
    score += 12;
  } else if (debtToAssetRatio <= 30) {
    score += 9;
  } else if (debtToAssetRatio <= 50) {
    score += 5;
  }

  // -----------------------------------
  // INVESTMENT ALLOCATION
  // -----------------------------------

  if (investmentAllocation >= 60) {
    score += 15;
  } else if (investmentAllocation >= 40) {
    score += 12;
  } else if (investmentAllocation >= 25) {
    score += 8;
  } else if (investmentAllocation >= 10) {
    score += 4;
  }

  // -----------------------------------
  // LIQUIDITY
  // -----------------------------------

  const liquidityRatio =
    totalAssetsValue > 0
      ? (
          liquidAssetsValue /
          totalAssetsValue
        ) * 100
      : 0;

  if (
    liquidityRatio >= 10 &&
    liquidityRatio <= 30
  ) {
    score += 10;
  } else if (liquidityRatio >= 5) {
    score += 7;
  } else if (liquidityRatio > 0) {
    score += 4;
  }

  // -----------------------------------
  // EMERGENCY FUND
  // -----------------------------------

  if (emergencyMonths >= 12) {
    score += 10;
  } else if (emergencyMonths >= 9) {
    score += 9;
  } else if (emergencyMonths >= 6) {
    score += 8;
  } else if (emergencyMonths >= 3) {
    score += 5;
  } else if (emergencyMonths >= 1) {
    score += 2;
  }

  // -----------------------------------
  // RETIREMENT
  // -----------------------------------

  if (retirementAllocation >= 20) {
    score += 10;
  } else if (retirementAllocation >= 15) {
    score += 8;
  } else if (retirementAllocation >= 10) {
    score += 6;
  } else if (retirementAllocation >= 5) {
    score += 3;
  }

  // -----------------------------------
  // INSURANCE
  // -----------------------------------

  const hasLife =
    finance.some(
      (item) =>
        item.c?.n === 'LIFE I',
    );

  const hasHealth =
    finance.some(
      (item) =>
        item.c?.n === 'HEALTH I',
    );

  const hasTerm =
    finance.some(
      (item) =>
        item.c?.n === 'TERM I',
    );

  if (
    hasLife &&
    hasHealth &&
    hasTerm
  ) {
    score += 10;
  } else if (
    hasLife &&
    hasHealth
  ) {
    score += 8;
  } else if (
    hasLife ||
    hasHealth
  ) {
    score += 5;
  }

  // -----------------------------------
  // GOALS
  // -----------------------------------

  if (goalsValue > 0) {
    score += 5;
  }

  // -----------------------------------
  // DIVERSIFICATION
  // -----------------------------------

  let diversification = 0;

  if (investmentsValue > 0) {
    diversification++;
  }

  if (retirementCorpus > 0) {
    diversification++;
  }

  if (liquidAssetsValue > 0) {
    diversification++;
  }

  const hasRealAssets =
    finance.some(
      (item) => {

        const category =
          item.c?.n;

        return (
          typeof category === 'string' &&
          FINANCE_BUCKETS
            .REAL_ASSETS_BUCKET
            .includes(category)
        );
      },
    );

  if (hasRealAssets) {
    diversification++;
  }

  const hasReceivables =
    finance.some(
      (item) => {

        const category =
          item.c?.n;

        return (
          typeof category === 'string' &&
          FINANCE_BUCKETS
            .RECEIVABLES_BUCKET
            .includes(category)
        );
      },
    );

  if (hasReceivables) {
    diversification++;
  }

  score += Math.min(
    diversification,
    5,
  );

  // -----------------------------------
  // FINAL SCORE
  // -----------------------------------

  const financialFreedomScore =
    Math.min(
      100,
      Math.round(score),
    );

  // -----------------------------------
  // RESULT
  // -----------------------------------

  return {

    networthValue,

    totalAssetsValue,

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

    expenseSummaryCategories,

    getExpenseAmount,

  };
};