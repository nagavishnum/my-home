import {
  FINANCE_BUCKETS,
} from '@/lib/constants';

import {
  ExpenseSummaryData,
  Finance,
  FinanceSnapshot,
} from '@/lib/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type FinanceItem = Finance & {
  c?: {
    _id?: string;
    n?: string;
  } | null;

  cv?: number | string | null;
  a?: number | string | null;
  md?: string | Date | null;
};

type SnapshotCategoryValue = {
  categoryId: string;
  categoryName: string;
  value: number;
};

export type AssetAllocationItem = {
  categoryId: string;
  name: string;
  value: number;
  percentage: number;
};

export type FinanceHistoryItem = {
  period: number;
  year: number;
  month: number;
  monthName: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
};

export type WealthTrend = {
  status:
    | 'insufficient-data'
    | 'getting-richer'
    | 'mixed'
    | 'getting-poorer';

  positiveMonths: number;
  negativeMonths: number;
  consecutiveGrowthMonths: number;
};

export type FinancialSafetyStatus =
  | 'Strong'
  | 'Moderate'
  | 'Low'
  | 'No expense data';

export type InsuranceStatus = {
  healthInsurance: {
    active: boolean;
    value: number;
  };

  termInsurance: {
    active: boolean;
    value: number;
  };

  lifeInsurance: {
    active: boolean;
    value: number;
  };

  score: number;
  maxScore: number;
};

export type FinanceScoreImprovement = {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
};

export type FinanceScore = {
  score: number;
  maxScore: 10;
  label: string;
  improvements: FinanceScoreImprovement[];
};

const getCategoryName = (
  item: FinanceItem,
): string => {
  return item.c?.n ?? 'OTHER';
};

const getCategoryId = (
  item: FinanceItem,
): string => {
  return String(
    item.c?._id ?? '',
  );
};

const getMonthPeriod = (
  year: number,
  month: number,
): number => {
  return year * 100 + month;
};

const getSnapshotForPeriod = (
  snapshots: FinanceSnapshot[],
  period: number,
): FinanceSnapshot | null => {
  return (
    snapshots.find(
      (snapshot) =>
        Number(snapshot.p) === period,
    ) ?? null
  );
};

const buildCategoryMap = (
  finance: FinanceItem[],
): Map<string, string> => {
  const map = new Map<string, string>();

  finance.forEach((item) => {
    const id = getCategoryId(item);

    if (id) {
      map.set(
        id,
        getCategoryName(item),
      );
    }
  });

  return map;
};

const getSnapshotCategoryValues = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): SnapshotCategoryValue[] => {
  if (!snapshot) {
    return [];
  }

  const categoryMap =
    buildCategoryMap(finance);

  return (snapshot.c ?? []).map(
    (item) => ({
      categoryId: String(item.k),
      categoryName:
        categoryMap.get(
          String(item.k),
        ) ?? 'OTHER',
      value:
        Number(item.v) || 0,
    }),
  );
};

/*
 * IMPORTANT:
 *
 * All financial classification goes
 * through FINANCE_BUCKETS.
 */
const getSnapshotBucketValue = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
  bucket: readonly string[],
): number => {
  return getSnapshotCategoryValues(
    snapshot,
    finance,
  )
    .filter((item) =>
      bucket.includes(
        item.categoryName,
      ),
    )
    .reduce(
      (sum, item) =>
        sum + item.value,
      0,
    );
};

const getSnapshotAssets = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): number => {
  return getSnapshotBucketValue(
    snapshot,
    finance,
    FINANCE_BUCKETS.ASSETS_BUCKET,
  );
};

const getSnapshotLiabilities = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): number => {
  return getSnapshotBucketValue(
    snapshot,
    finance,
    FINANCE_BUCKETS.LIABILITY_BUCKET,
  );
};

const getNetWorthFromSnapshot = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): number => {
  if (!snapshot) {
    return 0;
  }

  return (
    getSnapshotAssets(
      snapshot,
      finance,
    ) -
    getSnapshotLiabilities(
      snapshot,
      finance,
    )
  );
};

/* =========================================================
   METRIC MONTH
========================================================= */

const getMetricMonth = (
  snapshots: FinanceSnapshot[],
  selectedYear: number,
  currentMonth: number,
): number => {
  const currentYear =
    new Date().getFullYear();

  const yearSnapshots =
    snapshots
      .filter(
        (snapshot) =>
          Math.floor(
            Number(snapshot.p) / 100,
          ) === selectedYear,
      )
      .sort(
        (a, b) =>
          Number(b.p) -
          Number(a.p),
      );

  if (
    yearSnapshots.length > 0
  ) {
    return (
      Number(
        yearSnapshots[0].p,
      ) % 100
    );
  }

  if (
    selectedYear === currentYear
  ) {
    return currentMonth;
  }

  return 12;
};

/* =========================================================
   ASSET ALLOCATION
========================================================= */

const getAssetAllocation = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): AssetAllocationItem[] => {
  const totalAssets =
    getSnapshotAssets(
      snapshot,
      finance,
    );

  if (
    !snapshot ||
    totalAssets <= 0
  ) {
    return [];
  }

  return getSnapshotCategoryValues(
    snapshot,
    finance,
  )
    .filter((item) =>
      FINANCE_BUCKETS.ASSETS_BUCKET.includes(
        item.categoryName,
      ),
    )
    .filter(
      (item) => item.value > 0,
    )
    .map((item) => ({
      categoryId:
        item.categoryId,
      name: item.categoryName,
      value: item.value,
      percentage:
        (item.value /
          totalAssets) *
        100,
    }))
    .sort(
      (a, b) =>
        b.value - a.value,
    );
};

/* =========================================================
   INVESTMENTS
========================================================= */

const getInvestmentValue = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): number => {
  return getSnapshotBucketValue(
    snapshot,
    finance,
    FINANCE_BUCKETS.INVESTMENTS_BUCKET,
  );
};

const getRetirementValue = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): number => {
  return getSnapshotBucketValue(
    snapshot,
    finance,
    FINANCE_BUCKETS.RETIREMENT_BUCKET,
  );
};

/* =========================================================
   INSURANCE
========================================================= */

const getInsuranceStatus = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): InsuranceStatus => {
  const healthInsurance =
    getSnapshotBucketValue(
      snapshot,
      finance,
      ['HEALTH I'],
    );

  const termInsurance =
    getSnapshotBucketValue(
      snapshot,
      finance,
      ['TERM I'],
    );

  const lifeInsurance =
    getSnapshotBucketValue(
      snapshot,
      finance,
      ['LIFE I'],
    );

  let score = 0;

  if (healthInsurance > 0) {
    score += 1;
  }

  if (termInsurance > 0) {
    score += 1;
  }

  return {
    healthInsurance: {
      active:
        healthInsurance > 0,
      value: healthInsurance,
    },

    termInsurance: {
      active:
        termInsurance > 0,
      value: termInsurance,
    },

    lifeInsurance: {
      active:
        lifeInsurance > 0,
      value: lifeInsurance,
    },

    score,
    maxScore: 2,
  };
};

/* =========================================================
   EXPENSES
========================================================= */

const getExpenseMonthValue = (
  expenseSummaryData:
    | ExpenseSummaryData
    | null,
  month: number,
): number => {
  if (
    !expenseSummaryData?.months
  ) {
    return 0;
  }

  const monthName =
    MONTHS[month - 1];

  const monthData =
    expenseSummaryData.months.find(
      (item) =>
        item.m === monthName,
    );

  return Number(
    monthData?.t ?? 0,
  );
};

/*
 * Emergency fund calculation:
 *
 * Current month is excluded.
 * We use the previous 3 available
 * months.
 */
const getPreviousThreeMonthAverageExpenses = (
  expenseSummaryData: ExpenseSummaryData | null,
  currentMonth: number,
): number => {
  if (!expenseSummaryData?.months) return 0;

  const previousMonths: number[] = [];

  for (let offset = 1; offset <= 3; offset++) {
    const month = currentMonth - offset;

    if (month < 1) break;

    const monthData = expenseSummaryData.months.find(
      (item) => item.m === MONTHS[month - 1],
    );

    if (!monthData) continue;

    const total = Number(monthData.t ?? 0);

    const assetExpense = Number(
      monthData.c?.find(
        (category) => category.n === 'ASSET',
      )?.a ?? 0,
    );

    const actualExpense = total - assetExpense;

    if (actualExpense > 0) {
      previousMonths.push(actualExpense);
    }
  }

  if (previousMonths.length === 0) return 0;

  return (
    previousMonths.reduce(
      (sum, value) => sum + value,
      0,
    ) / previousMonths.length
  );
};

/* =========================================================
   WEALTH HISTORY
========================================================= */

const getFinanceHistory = (
  snapshots: FinanceSnapshot[],
  finance: FinanceItem[],
): FinanceHistoryItem[] => {
  return snapshots
    .map((snapshot) => {
      const period =
        Number(snapshot.p);

      const year =
        Math.floor(period / 100);

      const month =
        period % 100;

      const assets =
        getSnapshotAssets(
          snapshot,
          finance,
        );

      const liabilities =
        getSnapshotLiabilities(
          snapshot,
          finance,
        );

      const netWorth =
        assets - liabilities;

      const debtToAssetRatio =
        assets > 0
          ? (liabilities /
              assets) *
            100
          : 0;

      return {
        period,
        year,
        month,
        monthName:
          MONTHS[month - 1] ??
          'Unknown',
        assets,
        liabilities,
        netWorth,
        debtToAssetRatio,
      };
    })
    .sort(
      (a, b) =>
        a.period - b.period,
    );
};

/* =========================================================
   WEALTH TREND
========================================================= */

const getWealthTrend = (
  history: FinanceHistoryItem[],
): WealthTrend => {
  if (history.length < 2) {
    return {
      status:
        'insufficient-data',
      positiveMonths: 0,
      negativeMonths: 0,
      consecutiveGrowthMonths: 0,
    };
  }

  let positiveMonths = 0;
  let negativeMonths = 0;

  for (
    let i = 1;
    i < history.length;
    i++
  ) {
    const previous =
      history[i - 1].netWorth;

    const current =
      history[i].netWorth;

    if (
      current > previous
    ) {
      positiveMonths++;
    } else if (
      current < previous
    ) {
      negativeMonths++;
    }
  }

  let consecutiveGrowthMonths = 0;

  for (
    let i =
      history.length - 1;
    i > 0;
    i--
  ) {
    const current =
      history[i].netWorth;

    const previous =
      history[i - 1].netWorth;

    if (
      current > previous
    ) {
      consecutiveGrowthMonths++;
    } else {
      break;
    }
  }

  if (
    consecutiveGrowthMonths >= 3
  ) {
    return {
      status:
        'getting-richer',
      positiveMonths,
      negativeMonths,
      consecutiveGrowthMonths,
    };
  }

  if (
    positiveMonths >
    negativeMonths
  ) {
    return {
      status: 'mixed',
      positiveMonths,
      negativeMonths,
      consecutiveGrowthMonths,
    };
  }

  return {
    status:
      'getting-poorer',
    positiveMonths,
    negativeMonths,
    consecutiveGrowthMonths,
  };
};

/* =========================================================
   FINANCIAL SAFETY
========================================================= */

const getFinancialSafetyStatus = (
  emergencyMonths: number,
  liquidAssets: number,
): FinancialSafetyStatus => {
  if (
    liquidAssets <= 0
  ) {
    return 'Low';
  }

  if (
    emergencyMonths >= 6
  ) {
    return 'Strong';
  }

  if (
    emergencyMonths >= 3
  ) {
    return 'Moderate';
  }

  return 'Low';
};

/* =========================================================
   FINANCE SCORE
========================================================= */

const getFinanceScore = ({
  totalAssets,
  totalLiabilities,
  debtToAssetRatio,
  liquidAssets,
  emergencyMonths,
  investmentValue,
  retirementValue,
  insuranceStatus,
  assetAllocation,
  wealthTrend,
}: {
  totalAssets: number;
  totalLiabilities: number;
  debtToAssetRatio: number;
  liquidAssets: number;
  emergencyMonths: number;
  investmentValue: number;
  retirementValue: number;
  insuranceStatus: InsuranceStatus;
  assetAllocation: AssetAllocationItem[];
  wealthTrend: WealthTrend;
}): FinanceScore => {
  /*
   * 10-point billionaire-style score.
   *
   * Focus:
   * 1. Net worth quality
   * 2. Debt control
   * 3. Liquidity
   * 4. Emergency protection
   * 5. Investment allocation
   * 6. Retirement
   * 7. Insurance
   * 8. Diversification
   * 9. Wealth trend
   * 10. Balance-sheet strength
   */

  let score = 0;

  const improvements: FinanceScoreImprovement[] =
    [];

  /*
   * 1. Debt — 1.5 points
   */
  let debtScore = 0;

  if (
    totalAssets > 0
  ) {
    if (
      debtToAssetRatio <= 10
    ) {
      debtScore = 1.5;
    } else if (
      debtToAssetRatio <= 20
    ) {
      debtScore = 1.25;
    } else if (
      debtToAssetRatio <= 35
    ) {
      debtScore = 0.75;
    } else if (
      debtToAssetRatio <= 50
    ) {
      debtScore = 0.4;
    }
  }

  score += debtScore;

  if (
    debtToAssetRatio > 35
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Reduce debt exposure',
      description:
        'Your debt-to-asset ratio is above the preferred range. Prioritize reducing liabilities before aggressively increasing lifestyle spending.',
    });
  }

  /*
   * 2. Liquidity — 1.5 points
   */
  let liquidityScore = 0;

  if (
    totalAssets > 0
  ) {
    const liquidityRatio =
      liquidAssets /
      totalAssets;

    if (
      liquidityRatio >= 0.15 &&
      liquidityRatio <= 0.4
    ) {
      liquidityScore = 1.5;
    } else if (
      liquidityRatio >= 0.1
    ) {
      liquidityScore = 1;
    } else if (
      liquidityRatio > 0
    ) {
      liquidityScore = 0.5;
    }
  }

  score += liquidityScore;

  if (
    liquidAssets <= 0
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Build liquid reserves',
      description:
        'Increase immediately accessible cash and savings so short-term financial shocks do not force you to sell long-term assets.',
    });
  }

  /*
   * 3. Emergency fund — 1.5 points
   */
  let emergencyScore = 0;

  if (
    emergencyMonths >= 6
  ) {
    emergencyScore = 1.5;
  } else if (
    emergencyMonths >= 3
  ) {
    emergencyScore = 1;
  } else if (
    emergencyMonths > 0
  ) {
    emergencyScore = 0.5;
  }

  score += emergencyScore;

  if (
    emergencyMonths < 6
  ) {
    improvements.push({
      priority:
        emergencyMonths < 3
          ? 'High'
          : 'Medium',
      title:
        'Increase emergency fund',
      description:
        `You currently have ${emergencyMonths.toFixed(
          1,
        )} months of expense coverage. Target at least 6 months.`,
    });
  }

  /*
   * 4. Investments — 1.5 points
   */
  let investmentScore = 0;

  if (
    totalAssets > 0
  ) {
    const investmentRatio =
      investmentValue /
      totalAssets;

    if (
      investmentRatio >= 0.3
    ) {
      investmentScore = 1.5;
    } else if (
      investmentRatio >= 0.2
    ) {
      investmentScore = 1;
    } else if (
      investmentRatio > 0
    ) {
      investmentScore = 0.5;
    }
  }

  score += investmentScore;

  if (
    investmentValue <= 0
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Build wealth-producing investments',
      description:
        'Increase assets classified under INVESTMENTS_BUCKET instead of allowing all wealth to remain in cash or non-investment assets.',
    });
  } else if (
    totalAssets > 0 &&
    investmentValue /
      totalAssets <
      0.2
  ) {
    improvements.push({
      priority: 'Medium',
      title:
        'Increase investment allocation',
      description:
        'Your investment bucket is below 20% of total assets. Gradually increase productive long-term investments.',
    });
  }

  /*
   * 5. Retirement — 1 point
   */
  let retirementScore = 0;

  if (
    totalAssets > 0
  ) {
    const retirementRatio =
      retirementValue /
      totalAssets;

    if (
      retirementRatio >= 0.15
    ) {
      retirementScore = 1;
    } else if (
      retirementRatio > 0
    ) {
      retirementScore = 0.5;
    }
  }

  score += retirementScore;

  if (
    retirementValue <= 0
  ) {
    improvements.push({
      priority: 'Medium',
      title:
        'Strengthen retirement corpus',
      description:
        'Increase long-term retirement assets so future financial independence does not depend entirely on active income.',
    });
  }

  /*
   * 6. Insurance — 1 point
   */
  const insuranceScore =
    insuranceStatus.score /
    insuranceStatus.maxScore;

  score += insuranceScore;

  if (
    !insuranceStatus
      .healthInsurance.active
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Add health insurance',
      description:
        'Health insurance is missing from your risk buffer. Protect the balance sheet from major medical expenses.',
    });
  }

  if (
    !insuranceStatus
      .termInsurance.active
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Add term insurance',
      description:
        'Term insurance is missing from your risk buffer. Add adequate protection for your dependents and liabilities.',
    });
  }

  /*
   * 7. Diversification — 0.75 points
   */
  let diversificationScore = 0;

  if (
    assetAllocation.length >= 4
  ) {
    diversificationScore = 0.75;
  } else if (
    assetAllocation.length >= 3
  ) {
    diversificationScore = 0.5;
  } else if (
    assetAllocation.length >= 2
  ) {
    diversificationScore = 0.25;
  }

  score += diversificationScore;

  if (
    assetAllocation.length < 3
  ) {
    improvements.push({
      priority: 'Medium',
      title:
        'Improve asset diversification',
      description:
        'Your current asset allocation is concentrated. Build exposure across multiple asset categories represented in your finance buckets.',
    });
  }

  /*
   * 8. Wealth trend — 1.25 points
   */
  let trendScore = 0;

  if (
    wealthTrend.status ===
    'getting-richer'
  ) {
    trendScore = 1.25;
  } else if (
    wealthTrend.status ===
    'mixed'
  ) {
    trendScore = 0.75;
  } else if (
    wealthTrend.status ===
    'insufficient-data'
  ) {
    trendScore = 0.5;
  }

  score += trendScore;

  if (
    wealthTrend.status ===
    'getting-poorer'
  ) {
    improvements.push({
      priority: 'High',
      title:
        'Reverse the declining wealth trend',
      description:
        'Recent snapshots show declining net worth. Focus on reducing liabilities and increasing productive assets.',
    });
  }

  /*
   * 9. Balance-sheet strength — 1 point
   */
  let balanceSheetScore = 0;

  if (
    totalAssets > 0
  ) {
    const netWorth =
      totalAssets -
      totalLiabilities;

    const netWorthRatio =
      netWorth /
      totalAssets;

    if (
      netWorthRatio >= 0.8
    ) {
      balanceSheetScore = 1;
    } else if (
      netWorthRatio >= 0.6
    ) {
      balanceSheetScore = 0.75;
    } else if (
      netWorthRatio >= 0.4
    ) {
      balanceSheetScore = 0.5;
    } else {
      balanceSheetScore = 0.25;
    }
  }

  score += balanceSheetScore;

  /*
   * Round to one decimal.
   */
  score =
    Math.round(
      score * 10,
    ) / 10;

  let label = 'Needs Attention';

  if (score >= 9) {
    label = 'Elite';
  } else if (score >= 8) {
    label = 'Excellent';
  } else if (score >= 7) {
    label = 'Strong';
  } else if (score >= 6) {
    label = 'Good';
  } else if (score >= 4) {
    label = 'Fair';
  }

  /*
   * Highest-impact improvements first.
   */
  const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  improvements.sort(
    (a, b) =>
      priorityWeight[
        b.priority
      ] -
      priorityWeight[
        a.priority
      ],
  );

  return {
    score,
    maxScore: 10,
    label,
    improvements:
      improvements.slice(
        0,
        4,
      ),
  };
};

/* =========================================================
   MAIN
========================================================= */

export const getFinanceCalculations = (
  finance: Finance[] = [],
  expenseSummaryData:
    | ExpenseSummaryData
    | null = null,
  financeSnapshots:
    | FinanceSnapshot[] = [],
  selectedYear: number =
    new Date().getFullYear(),
  currentMonth: number =
    new Date().getMonth() + 1,
) => {
  const safeFinance =
    finance as FinanceItem[];

  const sortedSnapshots =
    [...financeSnapshots]
      .sort(
        (a, b) =>
          Number(a.p) -
          Number(b.p),
      );

  const metricMonth =
    getMetricMonth(
      sortedSnapshots,
      selectedYear,
      currentMonth,
    );

  const metricMonthName =
    MONTHS[
      metricMonth - 1
    ] ?? MONTHS[0];

  const currentPeriod =
    getMonthPeriod(
      selectedYear,
      metricMonth,
    );

  const currentSnapshot =
    getSnapshotForPeriod(
      sortedSnapshots,
      currentPeriod,
    );

  const currentIndex =
    sortedSnapshots.findIndex(
      (snapshot) =>
        Number(snapshot.p) ===
        currentPeriod,
    );

  const previousSnapshot =
    currentIndex > 0
      ? sortedSnapshots[
          currentIndex - 1
        ]
      : null;

  /* =======================================================
     CORE WEALTH
  ======================================================= */

  const totalAssetsValue =
    getSnapshotAssets(
      currentSnapshot,
      safeFinance,
    );

  const totalLiabilitiesValue =
    getSnapshotLiabilities(
      currentSnapshot,
      safeFinance,
    );

  const networthValue =
    totalAssetsValue -
    totalLiabilitiesValue;

  const hasPreviousSnapshot =
    Boolean(previousSnapshot);

  const previousNetworthValue =
    previousSnapshot
      ? getNetWorthFromSnapshot(
          previousSnapshot,
          safeFinance,
        )
      : null;

  const networthChange =
    previousSnapshot
      ? networthValue -
        (previousNetworthValue ?? 0)
      : null;

  const networthGrowth =
    previousSnapshot &&
    previousNetworthValue !==
      null &&
    previousNetworthValue !== 0
      ? ((networthValue -
          previousNetworthValue) /
          Math.abs(
            previousNetworthValue,
          )) *
        100
      : null;

  /* =======================================================
     ASSET ALLOCATION
  ======================================================= */

  const assetAllocation =
    getAssetAllocation(
      currentSnapshot,
      safeFinance,
    );

  /* =======================================================
     INVESTMENTS
  ======================================================= */

  const investmentValue =
    getInvestmentValue(
      currentSnapshot,
      safeFinance,
    );

  const retirementValue =
    getRetirementValue(
      currentSnapshot,
      safeFinance,
    );

  /* =======================================================
     LIQUIDITY
  ======================================================= */

  const liquidAssetsValue =
    getSnapshotBucketValue(
      currentSnapshot,
      safeFinance,
      FINANCE_BUCKETS.LIQUID_ASSETS_BUCKET,
    );

  /*
   * IMPORTANT:
   *
   * Current month is excluded.
   * Emergency fund is based on
   * previous 3 months average.
   */
  const averagePreviousThreeMonthExpenses =
    getPreviousThreeMonthAverageExpenses(
      expenseSummaryData,
      metricMonth,
    );

  const emergencyMonths =
    averagePreviousThreeMonthExpenses >
    0
      ? liquidAssetsValue /
        averagePreviousThreeMonthExpenses
      : 0;

  const financialSafetyStatus =
    getFinancialSafetyStatus(
      emergencyMonths,
      liquidAssetsValue,
    );

  /* =======================================================
     INSURANCE / RISK BUFFER
  ======================================================= */

  const insuranceStatus =
    getInsuranceStatus(
      currentSnapshot,
      safeFinance,
    );

  /* =======================================================
     DEBT
  ======================================================= */

  const debtToAssetRatio =
    totalAssetsValue > 0
      ? (totalLiabilitiesValue /
          totalAssetsValue) *
        100
      : 0;

  /* =======================================================
     HISTORY
  ======================================================= */

  const financeHistory =
    getFinanceHistory(
      sortedSnapshots,
      safeFinance,
    );

  const wealthTrend =
    getWealthTrend(
      financeHistory,
    );

  /* =======================================================
     FINANCE SCORE
  ======================================================= */

  const financeScore =
    getFinanceScore({
      totalAssets:
        totalAssetsValue,

      totalLiabilities:
        totalLiabilitiesValue,

      debtToAssetRatio,

      liquidAssets:
        liquidAssetsValue,

      emergencyMonths,

      investmentValue,

      retirementValue,

      insuranceStatus,

      assetAllocation,

      wealthTrend,
    });

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    metricMonth,
    metricMonthName,

    /*
     * Net worth
     */
    networthValue,
    previousNetworthValue,
    networthChange,
    networthGrowth,
    hasPreviousSnapshot,

    /*
     * Assets / liabilities
     */
    totalAssetsValue,
    totalLiabilitiesValue,
    debtToAssetRatio,

    /*
     * Allocation
     */
    assetAllocation,

    /*
     * Investments
     */
    investmentValue,
    retirementValue,

    /*
     * Liquidity
     */
    liquidAssetsValue,

    /*
     * Emergency fund
     */
    averagePreviousThreeMonthExpenses,
    emergencyMonths,
    financialSafetyStatus,

    /*
     * Insurance
     */
    insuranceStatus,

    /*
     * Wealth trend
     */
    wealthTrend,

    /*
     * Finance score
     */
    financeScore,

    /*
     * Graph data only.
     */
    financeHistory,
  };
};