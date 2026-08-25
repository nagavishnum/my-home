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

type WealthTrend = {
  status:
    | 'insufficient-data'
    | 'getting-richer'
    | 'mixed'
    | 'getting-poorer';

  consecutiveGrowthMonths: number;
  positiveMonths: number;
  negativeMonths: number;
};

export type MonthlyCategory = {
  categoryId: string;
  categoryName: string;
};

export type MonthlyCategoryRow = {
  month: number;
  monthName: string;
  values: Record<string, number>;
};

/* =========================================================
   BASIC HELPERS
========================================================= */

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

const getCurrentValue = (
  item: FinanceItem,
): number => {
  return Number(
    item.cv ?? item.a ?? 0,
  );
};

const getInvestedValue = (
  item: FinanceItem,
): number => {
  return Number(item.a ?? 0);
};

const isInBucket = (
  category: string,
  bucket: readonly string[],
): boolean => {
  return bucket.includes(category);
};

const getMonthPeriod = (
  year: number,
  month: number,
): number => {
  return year * 100 + month;
};

/* =========================================================
   SNAPSHOT HELPERS
========================================================= */

const getSnapshotForPeriod = (
  snapshots: FinanceSnapshot[],
  period: number,
): FinanceSnapshot | null => {
  return (
    snapshots.find(
      (snapshot) =>
        snapshot.p === period,
    ) ?? null
  );
};

const getSnapshotCategoryValues = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
): SnapshotCategoryValue[] => {
  if (!snapshot) {
    return [];
  }

  const categoryNames = new Map<
    string,
    string
  >();

  finance.forEach((item) => {
    const id = getCategoryId(item);

    if (id) {
      categoryNames.set(
        id,
        getCategoryName(item),
      );
    }
  });

  return (snapshot.c ?? []).map(
    (item) => ({
      categoryId: String(item.k),
      categoryName:
        categoryNames.get(
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
      isInBucket(
        item.categoryName,
        bucket,
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

  return (
    assets - liabilities
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

  /*
   * Current year:
   * Always use the actual current month.
   */
  if (
    selectedYear ===
    currentYear
  ) {
    return currentMonth;
  }

  /*
   * Previous year:
   * Use the latest available snapshot
   * in that selected year.
   */
  const yearSnapshots =
    snapshots
      .filter(
        (snapshot) =>
          Math.floor(
            snapshot.p / 100,
          ) === selectedYear,
      )
      .sort(
        (a, b) =>
          b.p - a.p,
      );

  if (
    yearSnapshots.length > 0
  ) {
    return (
      yearSnapshots[0].p % 100
    );
  }

  return 12;
};

/* =========================================================
   EXPENSES
========================================================= */

const getSelectedMonthExpenses = (
  expenseSummaryData:
    | ExpenseSummaryData
    | null,
  year: number,
  month: number,
): number => {
  if (
    !expenseSummaryData?.months
  ) {
    return 0;
  }

  const monthName =
    MONTHS[month - 1];

  const metricMonth =
    expenseSummaryData.months.find(
      (item) =>
        item.m === monthName,
    );

  return Number(
    metricMonth?.t ?? 0,
  );
};

/* =========================================================
   CAPITAL DEPLOYMENT
========================================================= */

const getCapitalDeployment = (
  finance: FinanceItem[],
  year: number,
  month: number,
): number => {
  return finance
    .filter((item) => {
      if (!item.md) {
        return false;
      }

      const date =
        new Date(item.md);

      return (
        date.getFullYear() ===
          year &&
        date.getMonth() + 1 ===
          month
      );
    })
    .reduce(
      (sum, item) =>
        sum +
        getInvestedValue(item),
      0,
    );
};

/* =========================================================
   CATEGORY PERFORMANCE
========================================================= */

const getCategoryPerformance = (
  finance: FinanceItem[],
) => {
  const map = new Map<
    string,
    {
      name: string;
      invested: number;
      current: number;
      profit: number;
      returnPercentage: number;
    }
  >();

  finance.forEach((item) => {
    const name =
      getCategoryName(item);

    const invested =
      getInvestedValue(item);

    const current =
      getCurrentValue(item);

    const existing =
      map.get(name);

    if (existing) {
      existing.invested +=
        invested;

      existing.current +=
        current;

      existing.profit +=
        current - invested;
    } else {
      map.set(name, {
        name,
        invested,
        current,
        profit:
          current - invested,
        returnPercentage: 0,
      });
    }
  });

  return Array.from(
    map.values(),
  ).map((item) => ({
    ...item,
    returnPercentage:
      item.invested > 0
        ? (item.profit /
            item.invested) *
          100
        : 0,
  }));
};

/* =========================================================
   ASSET ALLOCATION
========================================================= */

const getAssetAllocation = (
  snapshot: FinanceSnapshot | null,
  finance: FinanceItem[],
) => {
  const totalAssets =
    getSnapshotAssets(
      snapshot,
      finance,
    );

  if (!totalAssets) {
    return [];
  }

  return getSnapshotCategoryValues(
    snapshot,
    finance,
  )
    .filter((item) =>
      isInBucket(
        item.categoryName,
        FINANCE_BUCKETS.ASSETS_BUCKET,
      ),
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
   WEALTH TREND
========================================================= */

const getWealthTrend = (
  snapshots: FinanceSnapshot[],
  finance: FinanceItem[],
  selectedYear: number,
): WealthTrend => {
  const selectedYearSnapshots =
    snapshots
      .filter(
        (snapshot) =>
          Math.floor(
            snapshot.p / 100,
          ) === selectedYear,
      )
      .sort(
        (a, b) =>
          a.p - b.p,
      );

  if (
    selectedYearSnapshots.length <
    2
  ) {
    return {
      status:
        'insufficient-data',
      consecutiveGrowthMonths: 0,
      positiveMonths: 0,
      negativeMonths: 0,
    };
  }

  let positiveMonths = 0;
  let negativeMonths = 0;

  for (
    let index = 1;
    index <
    selectedYearSnapshots.length;
    index++
  ) {
    const previous =
      getNetWorthFromSnapshot(
        selectedYearSnapshots[
          index - 1
        ],
        finance,
      );

    const current =
      getNetWorthFromSnapshot(
        selectedYearSnapshots[
          index
        ],
        finance,
      );

    if (current > previous) {
      positiveMonths++;
    } else if (
      current < previous
    ) {
      negativeMonths++;
    }
  }

  let consecutiveGrowthMonths = 0;

  for (
    let index =
      selectedYearSnapshots.length -
      1;
    index > 0;
    index--
  ) {
    const current =
      getNetWorthFromSnapshot(
        selectedYearSnapshots[
          index
        ],
        finance,
      );

    const previous =
      getNetWorthFromSnapshot(
        selectedYearSnapshots[
          index - 1
        ],
        finance,
      );

    if (current > previous) {
      consecutiveGrowthMonths++;
    } else {
      break;
    }
  }

  if (
    consecutiveGrowthMonths >= 3
  ) {
    return {
      status: 'getting-richer',
      consecutiveGrowthMonths,
      positiveMonths,
      negativeMonths,
    };
  }

  if (
    positiveMonths >
    negativeMonths
  ) {
    return {
      status: 'mixed',
      consecutiveGrowthMonths,
      positiveMonths,
      negativeMonths,
    };
  }

  return {
    status: 'getting-poorer',
    consecutiveGrowthMonths,
    positiveMonths,
    negativeMonths,
  };
};

/* =========================================================
   YEARLY MONTHLY CATEGORY TABLE
========================================================= */

const getMonthlyCategoryData = (
  snapshots: FinanceSnapshot[],
  finance: FinanceItem[],
  selectedYear: number,
): {
  monthlyCategories: MonthlyCategory[];
  monthlyCategoryRows: MonthlyCategoryRow[];
} => {
  const selectedYearSnapshots =
    snapshots.filter(
      (snapshot) =>
        Math.floor(
          snapshot.p / 100,
        ) === selectedYear,
    );

  /*
   * Category ID -> category name
   */
  const categoryNames =
    new Map<string, string>();

  finance.forEach((item) => {
    const id = getCategoryId(item);

    if (id) {
      categoryNames.set(
        id,
        getCategoryName(item),
      );
    }
  });

  /*
   * Collect every category that
   * appears in any snapshot for
   * the selected year.
   */
  const categoryMap =
    new Map<
      string,
      string
    >();

  selectedYearSnapshots.forEach(
    (snapshot) => {
      (snapshot.c ?? []).forEach(
        (item) => {
          const categoryId =
            String(item.k);

          const categoryName =
            categoryNames.get(
              categoryId,
            ) ?? 'OTHER';

          categoryMap.set(
            categoryId,
            categoryName,
          );
        },
      );
    },
  );

  const monthlyCategories =
    Array.from(
      categoryMap.entries(),
    )
      .map(
        ([
          categoryId,
          categoryName,
        ]) => ({
          categoryId,
          categoryName,
        }),
      )
      .sort((a, b) =>
        a.categoryName.localeCompare(
          b.categoryName,
        ),
      );

  /*
   * Always return all 12 months.
   */
  const monthlyCategoryRows =
    MONTHS.map(
      (monthName, index) => {
        const month =
          index + 1;

        const snapshot =
          selectedYearSnapshots.find(
            (item) =>
              item.p ===
              getMonthPeriod(
                selectedYear,
                month,
              ),
          );

        const values: Record<
          string,
          number
        > = {};

        monthlyCategories.forEach(
          (category) => {
            values[
              category.categoryId
            ] = 0;
          },
        );

        if (snapshot) {
          (
            snapshot.c ?? []
          ).forEach((item) => {
            const categoryId =
              String(item.k);

            if (
              categoryMap.has(
                categoryId,
              )
            ) {
              values[
                categoryId
              ] =
                Number(item.v) ||
                0;
            }
          });
        }

        return {
          month,
          monthName,
          values,
        };
      },
    );

  return {
    monthlyCategories,
    monthlyCategoryRows,
  };
};

/* =========================================================
   MAIN CALCULATIONS
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

  /*
   * IMPORTANT:
   * metricMonth is calculated INSIDE
   * the function.
   *
   * This fixes:
   * Cannot find name 'financeSnapshots'
   */
  const metricMonth =
    getMetricMonth(
      financeSnapshots,
      selectedYear,
      currentMonth,
    );

  const metricMonthName =
    MONTHS[
      metricMonth - 1
    ] ?? MONTHS[0];

  /*
   * Previous month.
   */
  const previousMetricMonth =
    metricMonth === 1
      ? 12
      : metricMonth - 1;

  const previousMetricYear =
    metricMonth === 1
      ? selectedYear - 1
      : selectedYear;

  const previousMetricMonthName =
    MONTHS[
      previousMetricMonth - 1
    ] ?? MONTHS[11];

  const currentPeriod =
    getMonthPeriod(
      selectedYear,
      metricMonth,
    );

  const previousPeriod =
    getMonthPeriod(
      previousMetricYear,
      previousMetricMonth,
    );

  const currentSnapshot =
    getSnapshotForPeriod(
      financeSnapshots,
      currentPeriod,
    );

  const previousSnapshot =
    getSnapshotForPeriod(
      financeSnapshots,
      previousPeriod,
    );

  /* =======================================================
     NET WORTH
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

  const previousNetworthValue =
    getNetWorthFromSnapshot(
      previousSnapshot,
      safeFinance,
    );

  const networthChange =
    previousSnapshot
      ? networthValue -
        previousNetworthValue
      : 0;

  const networthGrowth =
    previousSnapshot &&
    previousNetworthValue !== 0
      ? (networthChange /
          Math.abs(
            previousNetworthValue,
          )) *
        100
      : 0;

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

  const investmentsValue =
    getSnapshotBucketValue(
      currentSnapshot,
      safeFinance,
      FINANCE_BUCKETS.INVESTMENTS_BUCKET,
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

  const selectedMonthExpenses =
    getSelectedMonthExpenses(
      expenseSummaryData,
      selectedYear,
      metricMonth,
    );

  const emergencyMonths =
    selectedMonthExpenses > 0
      ? liquidAssetsValue /
        selectedMonthExpenses
      : 0;

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
     WEALTH CREATION
  ======================================================= */

  const wealthCreationRate =
    networthChange;

  /* =======================================================
     CAPITAL DEPLOYMENT
  ======================================================= */

  const monthlyCapitalDeployment =
    getCapitalDeployment(
      safeFinance,
      selectedYear,
      metricMonth,
    );

  /* =======================================================
     FINANCIAL FREEDOM
  ======================================================= */

  const financialFreedomNumber =
    selectedMonthExpenses *
    12 *
    25;

  const financialFreedomProgress =
    financialFreedomNumber > 0
      ? Math.min(
          100,
          (networthValue /
            financialFreedomNumber) *
            100,
        )
      : 0;

  /* =======================================================
     WEALTH TREND
  ======================================================= */

  const wealthTrend =
    getWealthTrend(
      financeSnapshots,
      safeFinance,
      selectedYear,
    );

  /* =======================================================
     PERFORMANCE
  ======================================================= */

  const financePerformance =
    getCategoryPerformance(
      safeFinance,
    );

  const profitItems =
    financePerformance
      .filter(
        (item) =>
          item.profit > 0,
      )
      .sort(
        (a, b) =>
          b.profit - a.profit,
      );

  const lossItems =
    financePerformance
      .filter(
        (item) =>
          item.profit < 0,
      )
      .sort(
        (a, b) =>
          a.profit - b.profit,
      );

  /* =======================================================
     YEARLY MONTHLY CATEGORY TABLE
  ======================================================= */

  const {
    monthlyCategories,
    monthlyCategoryRows,
  } = getMonthlyCategoryData(
    financeSnapshots,
    safeFinance,
    selectedYear,
  );

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    /*
     * Selected period
     */
    metricMonth,
    metricMonthName,
    previousMetricMonth,
    previousMetricMonthName,

    /*
     * Hero
     */
    networthValue,
    previousNetworthValue,
    networthChange,
    networthGrowth,

    /*
     * Core
     */
    totalAssetsValue,
    totalLiabilitiesValue,
    debtToAssetRatio,

    /*
     * Allocation
     */
    assetAllocation,
    investmentsValue,

    /*
     * Liquidity
     */
    liquidAssetsValue,
    selectedMonthExpenses,
    emergencyMonths,

    /*
     * Wealth creation
     */
    wealthCreationRate,
    monthlyCapitalDeployment,

    /*
     * Freedom
     */
    financialFreedomNumber,
    financialFreedomProgress,

    /*
     * Trend
     */
    wealthTrend,

    /*
     * Performance
     */
    financePerformance,
    profitItems,
    lossItems,

    /*
     * Monthly category table
     */
    monthlyCategories,
    monthlyCategoryRows,

    /*
     * Snapshots
     */
    currentSnapshot,
    previousSnapshot,
  };
};