# 🏠 My Home — Quick Glance

A personal **finance, expenses, goals & task management** web app built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**, backed by a REST API with JWT authentication and using **Recharts, jsPDF, XLSX, docx, Firebase, and Web Speech API** for reporting, authentication, and voice-command utilities.

Repo entry: `app/page.tsx` → redirects to `/dashboard` if logged in, else `/login`.

---

## 🔐 Auth Flow

* **Login page** (`app/login/page.tsx`): username + password form → `POST /auth/login` → stores `token` + `username` in `localStorage`.
* **`ProtectedRoute`** wraps all private pages; unauthenticated users are redirected to `/login`.
* **Axios interceptor** (`lib/api.ts`): attaches `Bearer` token, triggers global loader, auto-logs out on `401`.
* **Header** (`AppHeader.tsx`): shows logged-in username + Logout link.

---

## 🧭 Navigation (Top Tabs — `components/Navbar.tsx`)

| Tab       | Route          | Purpose                               |
| --------- | -------------- | ------------------------------------- |
| Dashboard | `/dashboard`   | Overall KPI + charts view             |
| Expenses  | `/expenses`    | Manage daily expenses                 |
| Finance   | `/financebook` | Manage investments/assets/liabilities |
| Todos     | `/todos`       | Todos + Goals + Daily Todos           |

---

# 📊 1. Dashboard (`/dashboard`)

The main analytics screen. Data is loaded in parallel from `/expenses/dashboard`, `/finance`, `/todos`, `/goal` via `useDashboardData()`.

### 🔢 Metrics Grid (`Metrics.tsx`)

Clickable cards that scroll to the relevant section:

* 🚀 **Freedom Score** (0–100) — headline highlight card
* 💰 Net Worth, 🏦 Total Assets, 📉 Liabilities
* 📈 Investments, 💧 Liquid Assets, 🏖 Retirement, 🛡 Insurance
* ⚖ Debt/Asset Ratio, 🚨 Emergency Fund (months of coverage)
* 💳 Monthly Commitments (EMIs etc.)
* 📅 Year Expenses, 💸 Month Expenses
* ✅ Todos count

### 📊 Expenses Section (`ExpensesSection.tsx`)

* **Month/Year filter** → refetches `/expenses/dashboard?year=&month=`
* **Donut/Pie chart** of expenses by category using Recharts
* Category totals sorted descending
* Responsive across mobile/tablet/desktop

### 📈 Finance Section (`FinanceSection.tsx`)

* **Financial Health card**: Freedom Score, Net Worth, Total Assets, Total Debt, Debt/Asset %, Emergency Fund months
* **Wealth Allocation card**: % split across Investments / Retirement / Insurance / Goal Funds
* **Top 5 Performing Categories** (green profit)
* **Worst 5 Performing Categories** (red loss)
* Calculations powered by `getFinanceCalculations.ts` using **FINANCE_BUCKETS** in `lib/constants.ts`:

  * Assets
  * Investments
  * Liquid
  * Retirement
  * Goals
  * Insurance
  * Receivables
  * Liability
  * Commitments
  * Other

### ✅ Todos Section (`TodosSection.tsx`)

* **Priority distribution** with animated progress bars:

  * Low
  * Medium
  * High
  * Mandatory
* Shows count + percentage per priority

### 🎯 Goals Section (`GoalsSection.tsx`)

Two pie charts:

* **Category-wise Goals**
* **Status-wise Goals** — pending / in-progress / completed etc.

---

# 💸 2. Expenses (`/expenses` — `components/pages/Expenses.tsx`)

CRUD manager for expenses:

```ts
Expense = {
  amount,
  category,
  date
}
```

### UI shows:

* **Add / Edit Expense** modal form (`ExpensesForm.tsx`)

  * Amount
  * Category
  * Date
* **Manage Categories** modal (`CategoriesModel.tsx` → `Categories.tsx`)

  * Add
  * Edit
  * Delete expense categories
* **Table** (`CommonTable`)

  * Amount
  * Category
  * Date
  * Actions
* **Filters** (`TableFilters`)

  * Date range
  * Month
  * Year
* **Bulk selection** with checkbox list
* **Compress Expenses** button → `POST /expenses/compress`
* **Export**

  * PDF
  * Excel
  * Word
* Mobile-first responsive layout via `TablePlusFiltersLayout`

### 🎙️ Voice Expense Input

Expenses can also be added using **voice commands** through the Web Speech API.

The voice functionality is integrated into `ExpensesForm.tsx` using:

```text
VoiceInput
    ↓
useSpeechRecognition
    ↓
parseExpenseSpeech
    ↓
handleVoiceExpense
    ↓
Expense form fields
    ↓
User reviews/edits
    ↓
Save
```

The microphone button is displayed when creating a new expense.

Example:

> **"Food 450 tomorrow"**

The parser identifies:

```ts
{
  a: "450",
  c: "<Food category ID>",
  d: "YYYY-MM-DD"
}
```

The parsed values populate the existing expense form rather than directly submitting the expense. This allows the user to review or modify the generated values before saving.

### Supported voice parsing

#### Amount

Supports numeric amounts such as:

* `450`
* `₹450`
* `1,250`
* `450.50`

Example:

> `"Food 1,250 today"`

→ Amount:

```text
1250
```

#### Category

The parser matches the spoken category against the categories already loaded in the application.

Matching is:

* Case-insensitive
* Based on the actual category list
* Longest category names are checked first to avoid partial matching issues

Example categories:

```text
Food
Shopping
Online Shopping
Travel
```

Voice command:

> `"Online Shopping 500 today"`

→ `Online Shopping` is selected instead of `Shopping`.

#### Date

Supported natural date keywords:

* `today`
* `tomorrow`
* `yesterday`

If no date is spoken, **today is used by default**.

Examples:

```text
"Food 450"
→ today's date

"Food 450 tomorrow"
→ tomorrow's date

"Food 450 yesterday"
→ yesterday's date
```

### 🎙️ Voice Recognition Behavior

The reusable `VoiceInput` component manages:

* Start listening
* Stop listening
* Transcript handling
* Parsing
* Resetting recognition state
* Microphone UI state

The recognition hook (`useSpeechRecognition.ts`) uses:

```ts
window.SpeechRecognition ??
window.webkitSpeechRecognition
```

with:

```ts
recognition.lang = "en-IN";
recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;
```

After recognition ends, the transcript is passed to the relevant parser.

---

# 📈 3. Finance Book (`/financebook` — `components/pages/FinanceBook.tsx`)

Portfolio / balance-sheet manager.

Each Finance record includes:

* Name
* Category
* Total Invested (`a`)
* Current Value (`cv`)
* Type (`Monthly` SIP / `OneTime`)
* Monthly SIP amount (`sv`)
* Maturity date
* Last-paid
* Return %
* Notes

### UI shows:

* **Add / Edit Finance** modal (`FinanceForm.tsx`)
* **Manage Finance Categories** modal
* **Table columns**

  * Name
  * Category
  * Total Invested
  * Current Value
  * Type
  * Monthly SIP
  * Returns %
* **Filters**

  * Month
  * Year
  * Date range
* **PDF export**
* Drives all Dashboard net-worth / freedom-score calculations

---

# ✅ 4. Todos Hub (`/todos` — `TodosTab.tsx`)

Sub-tabbed screen with persisted active tab in `localStorage`.

---

## a) Todos (`Todos.tsx`)

Todos contain:

```ts
{
  t: string;  // Task
  da: string; // Due Date
  p: string;  // Priority
}
```

Supported priorities:

* `low`
* `medium`
* `high`
* `mandatory`

### UI

* Add/Edit modal (`TodosForm.tsx`)
* Filters
* Sorting by due date
* Table columns from `lib/columns.tsx`

### 🎙️ Voice Todo Input

Todos support voice-based task entry using the same reusable voice-recognition architecture.

Flow:

```text
User clicks microphone
        ↓
Speech Recognition starts
        ↓
User speaks todo
        ↓
Transcript
        ↓
Todo speech parser
        ↓
Task / Priority / Date extracted
        ↓
Todo form populated
        ↓
User reviews/edits
        ↓
Save Todo
```

Example voice command:

> **"Go to bath high priority tomorrow"**

Expected parsed data:

```ts
{
  t: "go to bath",
  p: "high",
  da: "YYYY-MM-DD"
}
```

The parser removes command keywords such as:

```text
high priority
tomorrow
```

from the task title and maps them to their corresponding fields.

For example:

```text
"Go to bath high priority tomorrow"
```

becomes:

```text
Task:     Go to bath
Priority: High
Due Date: Tomorrow
```

### 🛑 Voice Stop Command

Voice input can support a dedicated stop keyword/phrase such as:

> **"done"**

Example:

> **"Go to bath high priority tomorrow done"**

The intended behavior is:

```text
"Go to bath"       → Task
"high priority"   → Priority
"tomorrow"        → Due date
"done"            → Stop listening
```

`done` should **not** be stored in the task title.

The stop keyword can be handled inside the speech-recognition layer so the application can stop listening immediately once the command is detected.

---

## b) Goals (`Goals.tsx`)

Fields:

* Title
* Description
* Category
* Target Date
* Priority
* Status
* Target Value (`tv`)
* Current Value (`cv`)

Features:

* Categories loaded from `/categories/goal`
* Special handling when category name contains `"finance"` to show financial fields
* Icons for:

  * Category
  * Priority
  * Status
* Helpers:

  * `getGoalsCategoryIcon`
  * `getPriorityIcon`
  * `getStatusIcon`
* Filters
* Category manager modal

---

## c) Daily Todos (`DailyTodos.tsx`)

Simple recurring day-to-day tasks.

Each Daily Todo contains:

```text
Task
```

CRUD is handled through:

```text
/todos/dailytodo
```

---

# 🎙️ 5. Voice Command System

The application includes a reusable voice-command layer for quickly entering **Expenses and Todos**.

### Architecture

```text
                🎙️ VoiceInput
                      │
                      ▼
             useSpeechRecognition
                      │
                      ▼
                Transcript
                 /       \
                /         \
               ▼           ▼
    parseExpenseSpeech   parseTodoSpeech
            │                 │
            ▼                 ▼
     Expense Form         Todo Form
       Amount              Task
       Category            Priority
       Date                Due Date
```

### Shared Voice Component

`VoiceInput` is a generic reusable component:

```ts
type Props<T> = {
  parser: (transcript: string) => T;
  onParsed: (data: T) => void;
  disabled?: boolean;
  title?: string;
};
```

This allows different entities to provide their own parser while sharing the same speech-recognition UI and behavior.

### Speech Recognition Hook

`useSpeechRecognition.ts` handles:

* Browser speech-recognition initialization
* `en-IN` language configuration
* Start/stop controls
* Recognition errors
* Recognition completion
* Transcript state
* Resetting recognition

Browser compatibility is handled through:

```ts
window.SpeechRecognition ??
window.webkitSpeechRecognition
```

### Expense Parser

`parseExpenseSpeech.ts` extracts:

```text
Amount
Category
Date
```

from natural speech.

Example:

```text
"Food 450 tomorrow"
```

→

```ts
{
  a: "450",
  c: "<category-id>",
  d: "<tomorrow-date>"
}
```

### Todo Parser

The Todo parser extracts:

```text
Task
Priority
Due Date
```

Example:

```text
"Go to bath high priority tomorrow"
```

→

```ts
{
  t: "go to bath",
  p: "high",
  da: "<tomorrow-date>"
}
```

The parser should remove recognized command phrases from the task text so metadata such as `priority` and `tomorrow` does not become part of the saved task title.

### Voice Input UX

The microphone button has two states:

```text
🎤  Add using voice
```

and while listening:

```text
🎙️  Stop listening
```

The user can manually stop recognition using the microphone button.

The system can additionally support a voice stop command such as:

```text
"done"
```

to terminate the voice session.

---

# 🧱 Shared / Common UI

* `common/CommonTable.tsx` — reusable table with row actions and selection
* `common/TableFilters.tsx` — date range / month / year filter panel + `applyFilters` helper
* `common/TablePlusFilters.tsx` — responsive two-column layout
* `common/Loader.tsx` — global spinner tied to `useGlobalApiLoading()`
* Forms folder (`components/forms/`) — dedicated form components for each entity
* `lib/voicecommand/`

  * `voicebutton.tsx`
  * `useSpeechRecognition.ts`
  * `voiceExpenseParser.ts`
  * Todo voice parser

---

# 🎨 Styling & UX Highlights

* Tailwind v4 + custom CSS:

  * `app/globals.css`
  * `dashboard.css`
  * `forms.css`
* Fully responsive:

  * Mobile
  * Tablet
  * Desktop
* Emoji-driven, friendly metric cards
* Modal-based add/edit flows on mobile
* Priority color system via `PRIORITY_COLORS`
* Chart palette via `CHART_COLORS`
* Icons via `lucide-react`
* **Voice-powered expense and todo entry**
* Natural-language voice commands for common fields
* Review-before-save workflow for voice-generated data

---

# 🧠 What the app effectively does

1. Tracks **every expense** with categories, month/year filtering, exports, and compression.
2. Allows users to **add expenses using voice commands**, extracting amount, category, and date.
3. Maintains a **portfolio ledger** of investments, SIPs, assets, liabilities, insurance, and other financial records.
4. Auto-computes:

   * Financial Freedom Score
   * Net Worth
   * Debt Ratio
   * Emergency Fund months
   * Wealth Allocation %
   * Best/worst performing categories
5. Manages:

   * Todos
   * Daily Todos
   * Long-term Goals
6. Allows users to **create todos using natural voice commands**, extracting:

   * Task
   * Priority
   * Due Date
7. Supports optional voice stop commands such as **"done"** for hands-free input.
8. Presents everything in a **single unified Dashboard** with KPIs and interactive charts.
9. Supports **PDF / Excel / Word exports** of table data.
10. JWT-authenticated, single-user, mobile-friendly PWA-style experience.
11. Uses reusable voice-recognition infrastructure so additional voice-enabled modules can be added later.

---

# 🛠 Tech Stack Summary

* **Framework:** Next.js 16 (App Router, private route group `(private)`) + React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4
* **State/Data:** React hooks + Axios + `@tanstack/react-query` (available)
* **Charts:** Recharts
* **Exports:** jsPDF + jspdf-autotable + xlsx + docx + file-saver
* **Auth:** JWT (`localStorage`) + optional Firebase SDK
* **Icons:** lucide-react
* **Voice Recognition:** Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
* **Voice Features:** Natural-language expense and todo input
