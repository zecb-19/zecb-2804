# ZECB (Zero-Employee Company Builder) — Complete Guide & Test Plan

---

## PART 1: What Is This Application? (Plain English)

### The Simple Explanation

Imagine you have a business idea — maybe you want to track competitor prices, monitor government regulations, or watch for funding announcements — but you don't have a team to build the software for it.

**ZECB builds that software FOR you, automatically, in under 72 hours.**

Think of it like a **factory that builds mini software companies**. You tell it what you want to monitor, it builds the entire product — website, user accounts, alerts, emails, legal pages — everything. And then real customers can sign up and pay for your product.

### Who Is It For?

- Solo founders who want to launch a SaaS (Software as a Service) business
- Small business owners in Europe (Germany, Austria, Switzerland)
- Anyone who wants to run a software business without hiring developers

### What Does It Actually Do?

Here's the journey in simple steps:

```
YOU HAVE AN IDEA
       |
       v
  [1] Tell the AI your idea (or let it generate ideas for you)
       |
       v
  [2] Pick your favorite idea from the inbox
       |
       v
  [3] Fill out a "BuildSpec" (a form describing your product)
       |
       v
  [4] Hit "Build" — the system runs 11 automated steps (~15 minutes)
       |
       v
  [5] Review and approve the launch
       |
       v
  [6] Your product is LIVE! Real customers can sign up and use it
       |
       v
  [7] The system handles marketing emails, legal compliance, alerts, everything
```

### Real-World Example

Let's say you want to build a **"Price Monitor for Amazon Sellers"**:

1. You tell ZECB: *"I want to track competitor prices on Amazon for small sellers in Germany"*
2. The AI generates 3 variations of this idea with pricing suggestions (Free / €19/mo / €49/mo)
3. You pick the best one and fill in details (what to monitor, how often, how to alert users)
4. ZECB automatically builds:
   - A sign-up page for your customers
   - A dashboard where customers see price changes
   - Alert rules (e.g., "notify me if price drops more than 10%")
   - Email notifications
   - Legal pages (Privacy Policy, Terms of Service — required in Germany)
   - Stripe payment integration
5. You approve the launch, and your product goes live

### The Two Types of Users

| User Type | Who They Are | What They Do |
|-----------|-------------|--------------|
| **Operator** (You) | The business owner | Creates products, manages launches, reviews compliance |
| **Tenant** (Your Customer) | End user of YOUR product | Signs up for your monitoring product, sets up alerts, views data |

### Key Sections of the App

| Section | Purpose | Think of it as... |
|---------|---------|-------------------|
| **Dashboard** | Your home base — see all your products at a glance | Your business control room |
| **Idea Inbox** | AI-generated business ideas waiting for your review | A suggestion box from AI |
| **BuildSpec** | The form where you describe exactly what to build | A blueprint for your product |
| **Build Pipeline** | Watch the 11-step build process happen | A factory assembly line |
| **Launch Approval** | Final human check before going live | Quality control gate |
| **Portfolio** | All your live products in one place | Your product catalog |
| **Outreach** | Marketing emails, ads, social media content | Your marketing department |
| **Compliance Gates** | Legal checkboxes (GDPR, email rules) | Your legal department |
| **Audit Trail** | Log of everything the AI did and how much it cost | Your accountant's records |
| **Templates** | Pre-built product blueprints | Cookie cutters for products |
| **Patterns** | Reusable building blocks (email digests, CSV import, etc.) | LEGO bricks |
| **Settings** | Your account and billing | Your account settings |

---

## PART 2: Testing Flow

### Prerequisites

Before testing, you need:

```
1. Node.js installed (v18+)
2. PostgreSQL database running (connection string in .env.local)
3. A .env.local file with required environment variables:

   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   AUTH_SECRET=<random-32-byte-hex-string>
   MOCK_PROVIDERS=true        (uses fake data instead of real APIs)
   OPENROUTER_KEY=<optional>  (only if MOCK_PROVIDERS=false)
   STRIPE_SECRET_KEY=<optional>
   SMTP_HOST=<optional>
```

### How to Start the App

```bash
npm install        # Install dependencies (first time only)
npm run dev        # Start the development server
```

Then open your browser and go to: **http://localhost:3000**

---

### TEST FLOW 1: Operator Account Creation & Login

```
GOAL: Create an account and get into the dashboard
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Open http://localhost:3000 | Browser | See the landing page with "ZECB" branding |
| 2 | Click "Sign Up" or "Get Started" | Landing page (top-right) | A signup modal/form appears |
| 3 | Fill in First Name | Signup form | Field accepts text |
| 4 | Fill in Last Name | Signup form | Field accepts text |
| 5 | Fill in Email (use a real-looking one) | Signup form | Field accepts email format |
| 6 | Fill in Company name | Signup form | Field accepts text |
| 7 | Select Country | Signup form | Dropdown with country options |
| 8 | Enter Password (must have: 10+ chars, uppercase, lowercase, number, special char) | Signup form | e.g., `TestPass1!` |
| 9 | Confirm Password (same as above) | Signup form | Must match |
| 10 | Check "I accept Terms of Service" | Signup form | Checkbox required |
| 11 | Click "Create Account" | Signup form | Redirects to /dashboard |
| 12 | See the Dashboard | /dashboard | Welcome message with your first name, empty stats |

**Error Cases to Test:**

- [ ] Try signing up with a password shorter than 10 characters — should show error
- [ ] Try signing up without accepting Terms — should show error
- [ ] Try signing up with mismatched passwords — should show error
- [ ] Try signing up with an already-used email — should show error
- [ ] Try signing in with wrong password — should show error

---

### TEST FLOW 2: Generate & Review Ideas

```
GOAL: Let the AI create business ideas and review them
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Idea Inbox" in sidebar | Dashboard sidebar | Opens /dashboard/inbox |
| 2 | Click "Generate Ideas" button | Inbox page | A form appears asking about your target market |
| 3 | Fill in verticals (e.g., "e-commerce, logistics") | Generation form | Text field |
| 4 | Select region (e.g., "DACH") | Generation form | Dropdown |
| 5 | Set max OpEx budget | Generation form | Number field |
| 6 | Click "Generate" | Generation form | Loading spinner, then 3 idea cards appear |
| 7 | Read the generated ideas | Inbox | Each idea has: name, persona, pain point, pricing tiers, TAM |
| 8 | Click "Approve" on an idea you like | Idea card | Status changes to "Approved" (green) |
| 9 | Click "Reject" on an idea you don't like | Idea card | Status changes to "Rejected" (red) |
| 10 | Click "Promote to BuildSpec" on the best idea | Idea card | Redirects to /dashboard/buildspec with form pre-filled |

**What to Check:**

- [ ] All 3 ideas should have different names and approaches
- [ ] Each idea should include pricing tiers (Free / Starter / Pro)
- [ ] The cost of the AI generation should appear in the Audit Trail later
- [ ] Rejected ideas should stay in the list but be grayed out

---

### TEST FLOW 3: Create a BuildSpec & Start a Build

```
GOAL: Configure a product and watch it get built
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "BuildSpec Authoring" in sidebar | Sidebar | Opens /dashboard/buildspec 
| 2 | Fill in Product Slug (e.g., "price-tracker") | BuildSpec form | URL-safe name, lowercase |
| 3 | Fill in Product Name (e.g., "Price Tracker Pro") | BuildSpec form | Display name |
| 4 | Write a Tagline | BuildSpec form | Short marketing phrase |
| 5 | Select Data Sources (e.g., HTTP API, Web Scrape) | BuildSpec form | Multi-select checkboxes |
| 6 | Select Alert Types (e.g., Threshold, Change Rate) | BuildSpec form | Multi-select checkboxes |
| 7 | Select Notification Channels (e.g., Email, Slack) | BuildSpec form | Multi-select checkboxes |
| 8 | Configure Pricing Tiers (Free / Starter €19 / Pro €49) | BuildSpec form | Price and feature limits per tier |
| 9 | Pick brand colors | BuildSpec form | Color picker |
| 10 | Click "Create Build" | BuildSpec form | Redirects to /dashboard/pipeline |
| 11 | Watch the build progress | Pipeline page | Steps 1-11 advance automatically (~90 sec each) |
| 12 | See each step complete with green checkmarks | Pipeline page | Schema → Registry → Infra → ... → Launch Approval |

**The 11 Build Steps You'll See:**

```
Step  1: Schema Validation           (~90s)
Step  2: Product Registry Creation    (~90s)
Step  3: Infrastructure Provisioning  (~90s)
Step  4: Product Repo Init            (~90s)
Step  5: Data Source Config           (~90s)
Step  6: Alert Primitive Wiring       (~90s)
Step  7: Onboarding Flow Generation   (~90s)
Step  8: Marketing Site Generation    (~90s)
Step  9: Knowledge Base Init          (~90s)
Step 10: Integration Test Suite       (~90s)
Step 11: LAUNCH APPROVAL (WAITING)    (Manual!)
```

**What to Check:**

- [ ] Build should auto-advance through steps 1-10
- [ ] Step 11 should STOP and wait for your manual approval
- [ ] Each step should show cost in EUR
- [ ] The Dashboard should now show this product under "Active Builds"

---

### TEST FLOW 4: Launch Approval

```
GOAL: Review and approve a completed build for launch
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Launch Approval" in sidebar | Sidebar | Opens /dashboard/launches |
| 2 | Find your product in the pending list | Launches page | Shows product name, build summary |
| 3 | Review the build summary | Launches page | All 10 automated steps marked complete |
| 4 | Click "Approve Launch" | Launches page | Product status changes to "live" |
| 5 | Go back to Dashboard | Sidebar → Dashboard | Product now shows as "Live" |

**What to Check:**

- [ ] Only products at step 11 should appear in Launch Approval
- [ ] After approval, the product's status should be "live"
- [ ] The approval should be logged in the Audit Trail (who approved, when)

---

### TEST FLOW 5: Tenant (Customer) Sign-Up & Usage

```
GOAL: Act as a customer of your newly launched product
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Open http://localhost:3000/product/price-tracker | Browser | See the product sign-in/sign-up page |
| 2 | Click "Sign Up" tab | Product auth page | Sign-up form appears |
| 3 | Enter Name, Email, Password (8+ chars) | Sign-up form | Fields accept input |
| 4 | Click "Create Account" | Sign-up form | Redirects to /product/price-tracker/dashboard |
| 5 | See the tenant dashboard | Tenant dashboard | KPI cards (empty at first), product name displayed |
| 6 | Navigate to Data Sources | Tenant sidebar/nav | Data sources management page |
| 7 | Add a new data source (e.g., HTTP API) | Data source form | Enter URL, polling frequency |
| 8 | Navigate to Alert Rules | Tenant sidebar/nav | Alert rules page |
| 9 | Create a new alert rule | Alert rule form | Pick type (Threshold), set condition, pick channel |
| 10 | Check Observations | Observations page | Data points collected from your sources |
| 11 | Check Alerts | Alerts page | Any triggered alerts show here |

**What to Check:**

- [ ] Tenant login is completely separate from operator login
- [ ] Tenant can only see their own product, not others
- [ ] Free tier tenants should have limits (fewer data sources, slower check frequency)
- [ ] Password requirement is simpler (8+ chars, no complexity rules)

---

### TEST FLOW 6: Compliance Gates

```
GOAL: Verify legal compliance checks are tracked
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Compliance Gates" in sidebar | Sidebar | Opens /dashboard/compliance |
| 2 | See the compliance categories | Compliance page | DSGVO (18 checks), Email (6), Content (1), Audit (2) |
| 3 | Review each check | Compliance page | Status: not_started / in_progress / complete |
| 4 | Mark a check as complete | Compliance page | Status updates, timestamp recorded |
| 5 | Visit /legal/impressum | Browser | Auto-generated Impressum page |
| 6 | Visit /legal/datenschutz | Browser | Auto-generated Privacy Policy page |
| 7 | Visit /legal/agb | Browser | Auto-generated Terms page |

**What to Check:**

- [ ] All 27 compliance checks should be visible
- [ ] Legal pages should render without errors
- [ ] Marking a check complete should be logged in the audit trail

---

### TEST FLOW 7: Outreach & Marketing

```
GOAL: Test the marketing automation features
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Outreach Queues" in sidebar | Sidebar | Opens /dashboard/outreach |
| 2 | Select a live product | Outreach page | Product-specific outreach options |
| 3 | Generate Core Message | Outreach page | AI creates pain statements, promises, CTAs |
| 4 | Review generated content | Outreach page | Calm, pointed, and provocative versions |
| 5 | Generate Meta Ads Campaign | Outreach page | Campaign structure with audience targeting |
| 6 | View Email Sequences | Outreach page | Onboarding, engagement, re-engagement emails |

**What to Check:**

- [ ] Core message should have multiple versions (calm, pointed, provocative)
- [ ] Generated CTAs should have commitment levels (low, medium, high)
- [ ] Cost of each generation should appear in the audit trail

---

### TEST FLOW 8: Audit Trail & Cost Tracking

```
GOAL: Verify every action is logged with costs
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Audit Trail" in sidebar | Sidebar | Opens /dashboard/audit |
| 2 | See the list of agent runs | Audit page | Table showing every AI action |
| 3 | Check columns | Audit page | Agent name, task, status, cost (EUR), timestamp |
| 4 | Filter by product | Audit page | Only runs for selected product |
| 5 | Verify total monthly cost | Dashboard | Monthly OpEx shown on main dashboard |

**What to Check:**

- [ ] Every idea generation, build step, and outreach action should appear
- [ ] Each row should show which AI model was used
- [ ] Costs should be in EUR
- [ ] Failed operations should show status "failed"

---

### TEST FLOW 9: Settings & Billing

```
GOAL: Verify account management works
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Click "Settings" in sidebar | Sidebar | Opens /dashboard/settings |
| 2 | View account information | Settings page | Your name, email, company displayed |
| 3 | Check subscription status | Settings page | Free / Starter / Pro tier shown |
| 4 | Test logout | Top-right or sidebar | Click "Sign Out" → redirects to landing page |
| 5 | Test login again | Landing page | Sign in with your credentials → back to dashboard |

---

### TEST FLOW 10: Password Reset

```
GOAL: Verify the forgot-password flow works
```

**Steps:**

| # | Action | Where | Expected Result |
|---|--------|-------|-----------------|
| 1 | Go to the login page | Landing page → Sign In | Login form appears |
| 2 | Click "Forgot Password?" | Login form | Password reset form appears |
| 3 | Enter your email | Reset form | Confirmation message shown |
| 4 | Check email (or logs if MOCK_PROVIDERS=true) | Email/console | Reset link with token |
| 5 | Click the reset link | Email | Opens /reset-password page |
| 6 | Enter new password | Reset form | Must meet 10+ char requirements |
| 7 | Submit | Reset form | Success message, can log in with new password |

---

## PART 3: Step-by-Step User Instructions

### Getting Started (First Time Ever)

#### Step 1: Open the App

Open your web browser (Chrome, Firefox, Edge — any will work) and go to:

```
http://localhost:3000
```

You'll see a landing page explaining what ZECB does.

#### Step 2: Create Your Account

1. Look for a **"Sign Up"** or **"Get Started"** button — it's usually at the top-right
2. A form will appear. Fill in:
   - **First Name**: Your first name
   - **Last Name**: Your last name
   - **Email**: Your email address (this is your login)
   - **Company**: Your business name (can be anything)
   - **Country**: Select your country from the dropdown
   - **Password**: Must be at least 10 characters and include:
     - At least one UPPERCASE letter (A-Z)
     - At least one lowercase letter (a-z)
     - At least one number (0-9)
     - At least one special character (!@#$%^&*)
     - Example: `MyPassword1!`
   - **Confirm Password**: Type the same password again
3. Check the box that says **"I accept the Terms of Service"**
4. Click **"Create Account"**

You're in! You'll see your **Dashboard**.

#### Step 3: Understand the Dashboard

Your dashboard is your home base. Here's what you see:

- **Welcome message**: "Hello, [Your Name]"
- **Active Builds**: Products currently being built (empty at first)
- **Monthly OpEx**: How much the AI has cost you this month (€0.00 at first)
- **Product Stats**: Count of building / live / paused products

On the **left side**, there's a sidebar menu. This is how you navigate everything.

#### Step 4: Generate Your First Business Idea

1. Click **"Idea Inbox"** in the sidebar
2. Click the **"Generate Ideas"** button
3. Fill in:
   - **Verticals**: What industry? (e.g., "e-commerce", "real estate", "finance")
   - **Region**: Where are your customers? (e.g., "DACH" for Germany/Austria/Switzerland)
   - **Max Monthly OpEx**: How much can you spend to run this? (e.g., €300)
   - **Notes**: Any extra context (optional)
4. Click **"Generate"**
5. Wait 10-30 seconds — the AI is thinking!
6. You'll see **3 idea cards**. Each one has:
   - A product name
   - Who it's for (the target customer)
   - What problem it solves
   - Suggested pricing (Free / Starter / Pro)
   - Market size estimate

#### Step 5: Pick Your Best Idea

For each idea, you have 3 options:

- **Approve** (thumbs up): "This is interesting, save it"
- **Reject** (thumbs down): "Not for me"
- **Promote to BuildSpec** (rocket): "Let's BUILD this one!"

Click **"Promote to BuildSpec"** on your favorite idea.

#### Step 6: Configure Your Product (BuildSpec)

You'll be taken to a form that's pre-filled with info from your idea. Review and customize:

1. **Product Slug**: The URL name (e.g., `price-tracker` → your product lives at `/product/price-tracker`)
2. **Product Name**: The display name customers see
3. **Tagline**: One-line marketing pitch
4. **Data Sources**: How does your product get data?
   - HTTP API (pulls data from websites/APIs)
   - Web Scrape (reads web pages)
   - RSS Feed (follows news feeds)
   - CSV Upload (users upload spreadsheets)
   - And more...
5. **Alert Types**: What should trigger notifications?
   - Threshold (value goes above/below a number)
   - Change Rate (value changes by X%)
   - Absence (data stops coming)
   - Regex Match (text matches a pattern)
   - And more...
6. **Notification Channels**: How do users get alerted?
   - Email (always available)
   - Slack, SMS, WhatsApp, Telegram (optional)
7. **Pricing Tiers**: Set prices and limits for Free, Starter, Pro

Click **"Create Build"** when ready.

#### Step 7: Watch Your Product Being Built

You'll land on the **Build Pipeline** page. Watch as 11 steps complete automatically:

```
[=====>                    ] Step 3 of 11: Infrastructure Provisioning
```

Each step takes about 90 seconds. The whole thing finishes in ~15 minutes.

**You DON'T need to do anything** — just watch (or go grab coffee).

At **Step 11**, the system STOPS and waits for you.

#### Step 8: Approve the Launch

1. Go to **"Launch Approval"** in the sidebar
2. Find your product
3. Review the build summary — everything should be green
4. Click **"Approve Launch"**

**Your product is now LIVE!**

#### Step 9: Test Your Product as a Customer

Open a **new browser tab** (or an incognito/private window) and go to:

```
http://localhost:3000/product/your-product-slug
```

Replace `your-product-slug` with whatever slug you chose (e.g., `price-tracker`).

1. Click **"Sign Up"** tab
2. Enter a Name, Email, and Password (8+ characters is enough)
3. Click **"Create Account"**
4. You're now in the **customer dashboard** of YOUR product!

From here, a customer can:
- Add data sources to monitor
- Create alert rules
- View observations (collected data points)
- See triggered alerts

#### Step 10: Check Your Numbers

Back in your **operator dashboard** (the main one):

1. **Dashboard** → See your live product count and monthly costs
2. **Audit Trail** → See every AI action and its cost
3. **Compliance Gates** → Make sure all legal checkboxes are done
4. **Outreach Queues** → Generate marketing content for your product

---

### Quick Reference: Keyboard & Navigation

| Action | How |
|--------|-----|
| Go to Dashboard | Click "Dashboard" in sidebar |
| Switch between pages | Click items in the left sidebar |
| Close mobile menu | Press `Escape` key |
| Sign out | Click "Sign Out" at bottom of sidebar |

### Quick Reference: Important URLs

| URL | What It Is |
|-----|-----------|
| `/` | Landing page (public) |
| `/dashboard` | Your operator control panel |
| `/dashboard/inbox` | AI idea generator |
| `/dashboard/buildspec` | Product configuration form |
| `/dashboard/pipeline` | Build progress tracker |
| `/dashboard/launches` | Launch approval queue |
| `/dashboard/outreach` | Marketing tools |
| `/dashboard/compliance` | Legal compliance checklist |
| `/dashboard/audit` | Cost & activity log |
| `/dashboard/settings` | Account settings |
| `/product/[slug]` | Customer login for a specific product |
| `/product/[slug]/dashboard` | Customer dashboard |
| `/legal/impressum` | Legal: Impressum |
| `/legal/datenschutz` | Legal: Privacy Policy |
| `/legal/agb` | Legal: Terms of Service |
| `/reset-password` | Password reset page |

---

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check your `DATABASE_URL` in `.env.local` — is PostgreSQL running? |
| Build steps not advancing | Refresh the Pipeline page — steps auto-advance on page load |
| "Invalid password" on signup | Make sure it has 10+ characters, uppercase, lowercase, number, AND special character |
| Ideas not generating | Check if `OPENROUTER_KEY` is set (or `MOCK_PROVIDERS=true` for testing) |
| Emails not sending | Check SMTP settings or set `MOCK_PROVIDERS=true` (emails logged to console instead) |
| Page shows blank | Check the browser console (F12 → Console tab) for errors |
| "Unauthorized" error | Your session expired — sign in again |

---

### Glossary (Terms You'll See)

| Term | What It Means |
|------|---------------|
| **Operator** | You — the person building and managing products |
| **Tenant** | A customer who signs up and uses one of your products |
| **BuildSpec** | The configuration/blueprint for a product |
| **Pipeline** | The automated 11-step build process |
| **HITL** | "Human In The Loop" — a step where a human must approve |
| **OpEx** | Operating Expenses — how much it costs to run |
| **DSGVO** | German acronym for GDPR (data privacy law) |
| **Slug** | The URL-friendly name for your product (e.g., `price-tracker`) |
| **Agent Run** | One execution of an AI task (e.g., generating an idea) |
| **Core Message** | The main marketing message for your product |
| **Data Source** | Where your product gets its monitoring data from |
| **Alert Rule** | A condition that triggers a notification to a tenant |
| **Observation** | A single data point collected from a data source |
| **Pattern** | A reusable building block (like "Email Digest" or "CSV Import") |
| **Template** | A complete product blueprint (like "Monitoring-SaaS") |
| **Compliance Gate** | A legal checkbox that must be completed before launch |
