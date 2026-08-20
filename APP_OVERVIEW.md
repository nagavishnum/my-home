🏠 My Home --- Quick Glance

My Home is a personal finance, expense, investment, goal, and
task-management web app built with Next.js 16 (App Router), React 19,
TypeScript, and Tailwind CSS v4. It uses a REST API with JWT
authentication and includes Recharts, export utilities, Firebase
support, and Web Speech API voice features.

Entry: app/page.tsx → /dashboard when authenticated, otherwise
/login.

🔐 Authentication

Login: username/password → POST /auth/login → stores JWT token
and username in localStorage.

ProtectedRoute: protects private pages and redirects
unauthenticated users to /login.

Axios interceptor (lib/api.ts):

Adds Bearer token.

Controls global API loading state.

Automatically logs out on 401.

Header: displays username and logout action.

🧭 Navigation

Tab Route Purpose

Dashboard /dashboard Expense and financial
overview

Expenses /expenses Expense management

Finance /financebook Investments, assets,
liabilities and
financial records

📊 1. Dashboard

The dashboard is intentionally focused on Expenses + Finance.

The previous Metrics, Todos and Goals dashboard sections have been
removed.

💸 Expenses Section

ExpensesSection.tsx

The dashboard uses the yearly expense-summary API:

GET /expenses/yearly-summary?year=<year>

The summary is sourced from the expense summary data, not the raw
expenses collection.

Year filter

Years start from 2026.

The current year is selected by default.

Changing the year reloads the yearly summary.

Yearly expense table

The table provides a compact month/category view:

Category Jan Feb Mar ...

HOME FOOD ₹... ₹... ₹... ...
NEED ₹... ₹... ₹... ...
ASSET ₹... ₹... ₹... ...
... ... ... ... ...
Total ₹... ₹... ₹... ...

The table:

Shows all categories returned by the API.

Shows every month available in the selected year.

Uses — when a category has no expense for a month.

Keeps the category column sticky while horizontally scrolling on
smaller screens.

Wraps/scrolls content appropriately instead of forcing long values
onto one line.

Highlights the highest monthly amount for each category.

Uses subtle bucket-based colors rather than large/high-contrast
backgrounds.

Expense buckets

Expense categories are grouped in EXPENSE_BUCKETS:

Essential: HOME FOOD, NEED, MEDICINE, HOME GOODS,
OUTSIDE HEALTHY FOOD

Avoid: OUTSIDE FOOD, ENTERTAINMENT, LUXURY, CLOTHES

Asset: ASSET

Other: OTHER, TRAVEL

Bucket colors are defined through EXPENSE_BUCKET_STYLES.

The Avoid bucket uses a red accent to make discretionary spending
easy to identify, while essential, asset, and other categories use
separate subtle accents.

Expense summary API response

Example structure:

{
year: 2026,
months: [
{
m: "May",
t: 39641,
c: [
{ n: "HOME FOOD", a: 5411 },
{ n: "OUTSIDE FOOD", a: 1055 }
]
}
]
}

Where:

year = selected year.

m = month.

t = monthly total.

c = category summaries.

n = category name.

a = category amount.

📈 Finance Section

FinanceSection.tsx

The finance section calculates financial health from finance records
using getFinanceCalculations.ts and FINANCE_BUCKETS.

It covers:

Financial Freedom Score

Net Worth

Total Assets

Total Liabilities

Debt/Asset Ratio

Investments

Liquid Assets

Retirement Corpus

Insurance

Goal Funds

Monthly Commitments

Investment allocation

Retirement allocation

Insurance allocation

Goal allocation

Emergency-fund coverage

Diversification

Finance buckets

lib/constants.ts contains buckets for:

Assets

Investments

Liquid Assets

Real Assets

Retirement

Goals

Insurance

Receivables

Liabilities

Commitments

Other

💸 2. Expenses --- /expenses

Full CRUD manager for expenses.

Expense model

{
amount,
category,
date
}

UI

Add/Edit Expense modal.

Amount, category and date.

Category management.

Reusable CommonTable.

Date-range/month/year filters.

Bulk selection.

Expense compression via POST /expenses/compress.

PDF, Excel and Word export.

Responsive mobile-first layout.

Input validation

Forms use strict client-side validation for user-entered values,
including:

Required fields.

Numeric-only monetary values.

Valid dates.

Character limits on text inputs.

Prevention of invalid numeric input where applicable.

Enter-key submission where supported.

Validation before submit.

🎙️ 3. Voice Expense Input

Expenses can be created using Web Speech API.

Flow:

VoiceInput
↓
useSpeechRecognition
↓
parseExpenseSpeech
↓
Expense form
↓
User reviews/edits
↓
Save

Example:

"Food 450 tomorrow"

Produces:

{
a: "450",
c: "<category-id>",
d: "YYYY-MM-DD"
}

The values populate the form first, allowing review before saving.

Supported parsing

Amount - 450 - ₹450 - 1,250 - 450.50

Category - Case-insensitive. - Matches categories loaded by the
application. - Longer category names are checked first.

Date - today - tomorrow - yesterday - Defaults to today when
omitted.

📈 4. Finance Book --- /financebook

Portfolio and balance-sheet manager.

Finance records support:

Name

Category

Total Invested

Current Value

Monthly SIP / OneTime type

Monthly SIP amount

Maturity date

Last-paid date

Return %

Notes

UI

Add/Edit finance modal.

Finance category management.

Responsive table.

Month/year/date-range filters.

PDF export.

Finance data feeds dashboard net-worth and financial-freedom
calculations.

Input validation

Finance forms apply strict validation to:

Names and notes.

Monetary values.

SIP amounts.

Lock period.

Return percentage.

Dates.

Required fields.

Character limits.

Numeric ranges and invalid numeric input.

✅ 5. Todos Hub --- /todos

Todos, goals and daily todos remain available as a dedicated module.
They are not displayed as dashboard sections.

Todos

Todo model:

{
t: string; // Task
da: string; // Due date
p: string; // Priority
}

Priorities:

low

medium

high

mandatory

Features:

Add/Edit.

Filters.

Due-date sorting.

Responsive table.

Strict text/date validation.

Character limits.

Voice Todo Input

Example:

"Go to bath high priority tomorrow"

Produces:

{
t: "go to bath",
p: "high",
da: "YYYY-MM-DD"
}

Recognized command metadata is removed from the task title.

A voice stop phrase such as "done" can terminate listening without
being saved in the task.

Goals

Goals remain available inside the Todos Hub.

Supported fields:

Title

Description

Category

Target Date

Priority

Status

Target Value

Current Value

Features:

Goal categories from /categories/goal.

Finance-specific fields when applicable.

Category/priority/status icons.

Filters.

Category management.

Strict input validation and character limits.

Daily Todos

DailyTodos.tsx manages recurring day-to-day tasks.

API:

/todos/dailytodo

Supports CRUD operations and validated task input.

🎙️ 6. Voice Command System

Reusable voice infrastructure supports Expenses and Todos.

                 VoiceInput
                     │
                     ▼
          useSpeechRecognition
                     │
                     ▼
                 Transcript
                 /         \
                /           \
               ▼             ▼
    parseExpenseSpeech   parseTodoSpeech
            │                 │
            ▼                 ▼
      Expense Form        Todo Form

VoiceInput is generic:

type Props<T> = {
parser: (transcript: string) => T;
onParsed: (data: T) => void;
disabled?: boolean;
title?: string;
};

useSpeechRecognition.ts handles:

Browser recognition setup.

en-IN language.

Start/stop.

Errors.

Completion.

Transcript state.

Resetting recognition.

Browser compatibility using SpeechRecognition /
webkitSpeechRecognition.

🧱 7. Shared UI

Important reusable components:

common/CommonTable.tsx --- reusable table with row actions.

common/TableFilters.tsx --- date/month/year filtering.

common/TablePlusFilters.tsx --- responsive table/filter layout.

common/Loader.tsx --- global API loader.

components/forms/ --- entity-specific forms.

lib/voicecommand/ --- reusable voice functionality.

Common table behavior

Tables are responsive and support:

Editable/deletable rows.

Long-content wrapping.

Horizontal scrolling where required.

Mobile-friendly layouts.

Loading-state action disabling.

🎨 8. Styling & UX

Tailwind CSS v4 + custom CSS.

Responsive mobile/tablet/desktop layouts.

Modal-based forms.

lucide-react icons.

PRIORITY_COLORS.

CHART_COLORS.

Expense bucket colors through EXPENSE_BUCKET_STYLES.

Subtle expense highlighting for category/month comparisons.

Strict form validation and character limits.

Review-before-save workflow for voice input.

🧠 9. What the App Does

Tracks expenses with categories, filters, compression and exports.

Provides yearly expense summaries by month and category.

Groups expense categories into meaningful buckets and visually
differentiates them.

Highlights unusually high monthly category spending.

Supports voice-based expense entry.

Maintains investments, SIPs, assets, liabilities, insurance and
other financial records.

Calculates Net Worth, Financial Freedom Score, debt ratio,
emergency-fund coverage and wealth allocation.

Manages Todos, Daily Todos and Goals through the dedicated Todos
Hub.

Supports voice-based Todo creation.

Provides PDF, Excel and Word exports.

Uses JWT authentication and responsive/mobile-friendly UI.

Uses reusable components and voice infrastructure for future
modules.

🛠 Tech Stack

Framework: Next.js 16 App Router + React 19

Language: TypeScript

Styling: Tailwind CSS v4 + custom CSS

State/Data: React hooks + Axios + React Query available

Charts: Recharts

Exports: jsPDF, jspdf-autotable, XLSX, docx, file-saver

Authentication: JWT + localStorage + optional Firebase SDK

Icons: lucide-react

Voice: Web Speech API

Backend: REST API
