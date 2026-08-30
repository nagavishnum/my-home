import {
  CURRENT_YEAR,
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
  month: number,
): number => {
  return CURRENT_YEAR * 100 + month;
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

const getMetricMonth = (
  snapshots: FinanceSnapshot[],
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
          ) === currentYear,
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
    return currentMonth;
};

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

export const getFinanceCalculations = (
  finance: Finance[] = [],
  expenseSummaryData:
    | ExpenseSummaryData
    | null = null,
  financeSnapshots:
    | FinanceSnapshot[] = [],
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
      currentMonth,
    );

  const currentPeriod =
    getMonthPeriod(
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

  const assetAllocation =
    getAssetAllocation(
      currentSnapshot,
      safeFinance,
    );

  const liquidAssetsValue =
    getSnapshotBucketValue(
      currentSnapshot,
      safeFinance,
      FINANCE_BUCKETS.LIQUID_ASSETS_BUCKET,
    );

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

  const debtToAssetRatio =
    totalAssetsValue > 0
      ? (totalLiabilitiesValue /
          totalAssetsValue) *
        100
      : 0;

  const financeHistory =
    getFinanceHistory(
      sortedSnapshots,
      safeFinance,
    );

  return {
    networthValue,
    networthChange,
    networthGrowth,
    hasPreviousSnapshot,
    totalAssetsValue,
    totalLiabilitiesValue,
    debtToAssetRatio,
    assetAllocation,
    liquidAssetsValue,
    emergencyMonths,
    financeHistory,
  };
};