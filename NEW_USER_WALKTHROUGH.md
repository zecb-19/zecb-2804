# ZECB — New User Walkthrough (You Just Logged In, Now What?)

> You just created your account and you're staring at the Dashboard.
> This guide holds your hand through **every single click**, explains **every field**,
> and tells you **exactly what to type** — from zero to a launched product.

---

## SCREEN 1: Your Dashboard (What You See Right Now)

You're looking at your **Dashboard** — the home screen. Here's what each piece means:

```
+------------------------------------------------------------------+
|  LEFT SIDEBAR            |           MAIN AREA                   |
|                          |                                       |
|  Dashboard        <-- you are here                               |
|  Idea Inbox              |  "Welcome back, [Your Name]"          |
|  BuildSpec Authoring     |                                       |
|  Build Pipeline          |  +----------+ +----------+            |
|  Launch Approval         |  | Live     | | Build    |            |
|                          |  | products | | queue    |            |
|  Portfolio Control       |  | 0        | | 0        |            |
|  Outreach Queues         |  +----------+ +----------+            |
|  Audit Trail             |  +----------+ +----------+            |
|                          |  | Monthly  | | Pending  |            |
|  Templates               |  | opex     | | approvals|            |
|  Patterns                |  | €0.0000  | | 0        |            |
|                          |  +----------+ +----------+            |
|  Compliance Gates        |                                       |
|  Admin                   |  [Active builds: empty]               |
|  Settings                |  [Outreach snapshot: all dashes]      |
|                          |  [Pending approvals: all caught up]   |
|  Sign Out                |  [Recent activity: no activity yet]   |
+------------------------------------------------------------------+
```

### What the 4 KPI Cards Mean:

| Card | What It Shows | Your Current Value | What It Means |
|------|--------------|-------------------|---------------|
| **Live products** | How many products you've launched and are running | `0` — "ship your first one" | You haven't launched anything yet. That's normal! |
| **Build queue** | Products currently being built by the AI | `0` — "queue empty" | No builds are running. We'll start one soon. |
| **Monthly opex** | How much money the AI has spent this month (in EUR) | `€0.0000` | Nothing spent yet. Each AI action costs a tiny amount (pennies). |
| **Pending approvals** | Products finished building that need YOUR approval to go live | `0` — "all caught up" | No products waiting. Once you build one, it'll appear here. |

### What the Sections Below Mean:

- **Active builds** — Empty right now. Says *"No builds in flight"*. Once you start building a product, you'll see a progress bar here.
- **Outreach snapshot** — Shows marketing stats (all dashes right now). This fills up when you run marketing campaigns.
- **Pending approvals** — Says *"All caught up"*. When a product finishes building, you'll approve it here.
- **Recent activity** — Says *"No activity yet"*. Every AI action will be logged here with timestamps and costs.

### The Left Sidebar — Your Navigation Menu:

The sidebar is grouped into 4 sections. Here's what each link does:

**BUILD section** (this is where you create products):
| Link | What It Does | When To Use It |
|------|-------------|----------------|
| **Dashboard** | Takes you back to this home screen | Anytime you want the overview |
| **Idea Inbox** | AI generates business ideas for you | **YOUR NEXT STEP** — start here |
| **BuildSpec Authoring** | The form where you configure your product | After you pick an idea |
| **Build Pipeline** | Watch your product being built in 11 steps | After you submit a BuildSpec |
| **Launch Approval** | Approve a finished build to go live | After all 11 steps complete |

**OPERATE section** (manage running products):
| Link | What It Does | When To Use It |
|------|-------------|----------------|
| **Portfolio Control** | See all your live products | After you have live products |
| **Outreach Queues** | Generate marketing content, emails, ads | When you want customers |
| **Audit Trail** | See every AI action and its cost | When you want to check spending |

**CATALOG section** (pre-built building blocks):
| Link | What It Does | When To Use It |
|------|-------------|----------------|
| **Templates** | Product blueprints (currently: Monitoring-SaaS) | To learn what's available |
| **Patterns** | Reusable components like "Email Digest" or "CSV Import" | To learn what building blocks exist |

**SYSTEM section** (admin & settings):
| Link | What It Does | When To Use It |
|------|-------------|----------------|
| **Compliance Gates** | Legal checkboxes for GDPR/DSGVO compliance | Before launching to real customers |
| **Admin** | System administration | Usually not needed |
| **Settings** | Your account info, billing, subscription | To change your info or upgrade |

---

## SCREEN 2: Idea Inbox — Your First Step

### How To Get Here:
Click **"Idea Inbox"** in the left sidebar.

### What You See:
- Title: **"Idea Inbox"**
- Subtitle: *"Validated MarketSignalReports from the Architect Agent..."*
- A white card titled **"Generate ideas with the Architect Agent"**
- Below that: filter pills (All, Pending, Approved, Promoted, Rejected) — all showing 0
- A message: *"No ideas yet"*

### What To Do — Fill In The Generation Form:

The generation card has 4 fields. Here's exactly what each one means and what to type:

---

#### Field 1: "Target verticals or angles" (REQUIRED)

**What this means in simple English:**
What type of business or industry do you want to build a product for?

**What to type:**
Describe the type of customers you want to serve. Some examples you can copy-paste:

| If you're interested in... | Type this |
|---------------------------|-----------|
| Online shopping businesses | `e-commerce sellers who need to track competitor prices in Germany` |
| Restaurants & food | `DACH gastronomy operators, restaurant chains monitoring supplier prices` |
| Real estate | `real estate agents tracking property listings and price changes in Austria` |
| Finance & accounting | `regional accountants and tax advisors in Germany monitoring regulatory changes` |
| Construction & trades | `Handwerk SMBs tracking material prices and supplier availability` |
| Logistics & supply chain | `logistics companies monitoring shipping rates and delivery performance` |
| Generic / try anything | `small businesses in Germany that need automated monitoring of web data` |

**My recommendation for your first try:**
```
e-commerce sellers tracking competitor prices on marketplaces in Germany
```

---

#### Field 2: "Region" (DROPDOWN)

**What this means:**
Where are the customers for your product located?

**Options:**
| Option | What It Means |
|--------|--------------|
| **DE** | Germany only |
| **AT** | Austria only |
| **CH** | Switzerland only |
| **DACH** (default, recommended) | Germany + Austria + Switzerland combined |
| **EU** | All of Europe |

**My recommendation:** Leave it as **DACH** (it's already selected).

---

#### Field 3: "Operator monthly opex cap (€)" (NUMBER)

**What this means in simple English:**
How much are you willing to spend per month to run this product? This is YOUR cost to keep the product running (server costs, AI costs, etc.) — NOT the price your customers will pay.

**Default value:** `500` (meaning €500/month)

**What to enter:**
| Your budget | Enter |
|------------|-------|
| Just testing, keep costs minimal | `100` |
| Small side project | `300` |
| Serious business attempt | `500` (default) |
| Going all-in | `1000` or more |

**My recommendation:** Leave it as `500` for now. It's just a guideline for the AI.

---

#### Field 4: "Constraints, preferences, or anti-goals" (OPTIONAL)

**What this means:**
Any extra notes for the AI. Tell it what to avoid or what you specifically want.

**Examples you can type:**
| Situation | Type this |
|-----------|-----------|
| No preferences | Leave it blank |
| Want simple ideas | `prefer simple ideas with low complexity, no AI-heavy features` |
| Avoid specific things | `avoid price-monitoring (already exists), prefer compliance-related ideas` |
| Budget-conscious | `focus on ideas with low CAC under €50 and fast payback under 3 months` |

**My recommendation:** Leave it blank for your first time.

---

#### Now Click The Button:

Click the blue **"Generate 3 ideas"** button.

**What happens next:**
1. The button changes to **"Architect thinking..."** with a loading icon
2. Wait 10-30 seconds (the AI is generating ideas for you)
3. A green success message appears: *"Generated 3 ideas · cost €0.0500 · scroll below to review"*
4. Scroll down — you'll see **3 idea cards**

---

### Understanding The Idea Cards

Each idea card has these sections. Here's what they all mean:

```
+------------------------------------------------------------------+
| [vertical tag]  [status: Pending review]  [slug]                  |
|                                                                   |
| IDEA TITLE (e.g., "Price Alert for Amazon Sellers")               |
| For [role] at [company size] · [country]                          |
|                                                           €0.0167 |
|                                                                   |
| Pain: "The problem your customer has..."                          |
| Promise: "What your product will solve..."                        |
| Mechanism: "How it works..."                                      |
| TAM: "How big is the market..."                                   |
|                                                                   |
| +--------+  +--------+  +--------+  +----------+                 |
| | CAC    |  | LTV    |  | Payback|  |Confidence|                 |
| | €45    |  | €580   |  | 2.3 mo |  | medium   |                 |
| +--------+  +--------+  +--------+  +----------+                 |
|                                                                   |
| Data sources:          | Pricing:                                 |
|   http_api - "..."     |   Free: €0/mo                           |
|   webscrape - "..."    |   Starter: €19/mo                       |
|                        |   Pro: €49/mo                            |
|                        |                                          |
|                        | Channels: email, slack, webhook          |
|                                                                   |
| [Architect Agent reasoning v] (click to expand)                   |
|                                                                   |
| Created 2m ago            [Reject]  [Approve]  [Promote to Build] |
+------------------------------------------------------------------+
```

### What Each Number Means:

| Term | Meaning | Good Value |
|------|---------|-----------|
| **CAC** (Customer Acquisition Cost) | How much you'd spend to get ONE customer | Lower is better. Under €100 is good. |
| **LTV** (Lifetime Value) | How much money ONE customer brings you over their lifetime | Higher is better. Over €300 is good. |
| **Payback** | How many months until you make back your customer acquisition cost | Lower is better. Under 6 months is great. |
| **Confidence** | How sure the AI is about these numbers | `high` > `medium` > `low` |

### What To Do With Each Idea:

You have **3 buttons** for each idea:

| Button | What It Does | When To Click It |
|--------|-------------|-----------------|
| **Reject** | Marks the idea as "not interested" — it stays in the list but grayed out | You don't like this idea at all |
| **Approve** | Marks it as "interesting" — saves it for later | You like it but want to keep looking |
| **Promote to BuildSpec** | Takes this idea and starts building it! Redirects you to the build form with fields pre-filled | **This is the one you want for your best idea** |

### My Recommendation:

1. Read all 3 ideas
2. Pick the one that excites you the most
3. Click **"Promote to BuildSpec"** on that idea

This takes you to the next screen...

---

## SCREEN 3: BuildSpec Authoring — Configuring Your Product

### How You Got Here:
You clicked "Promote to BuildSpec" on an idea. (Or you can get here by clicking "BuildSpec Authoring" in the sidebar.)

### What You See:
A long form with multiple white cards. The form is **pre-filled** with data from your chosen idea. You can modify anything or leave the defaults.

**There's a purple banner at the top saying:**
*"Pre-filled from idea: [Your Idea Title]"*

### The Form — Card by Card, Field by Field:

---

#### CARD 1: Product Identity

This is the basic info about your product.

| Field | What It Means | What's Pre-filled | What To Change/Enter |
|-------|--------------|-------------------|---------------------|
| **Product slug** | The URL name for your product. Customers will visit `/product/this-slug` to sign up. | Something like `price-tracker-dach` | Only lowercase letters, numbers, and hyphens. Keep it short. Example: `price-monitor` |
| **Product name** | The display name customers see everywhere. | Something like `Price Tracker DACH` | Make it catchy! Example: `PriceWatch Pro` |
| **Tagline** | A short marketing phrase (max 140 characters). Shows on the product's landing page. | Something from the AI | Write a compelling one-liner. Example: `Track competitor prices automatically. Get alerts before your margins shrink.` |

---

#### CARD 2: Branding

Controls the visual look of your product.

| Field | What It Means | Default | What To Do |
|-------|--------------|---------|-----------|
| **Brand display name** | Name shown in the header/logo area | Same as product name | Leave it or change it |
| **Logo URL** | Link to your logo image | Empty (uses a placeholder) | If you have a logo hosted online, paste the URL. Otherwise leave blank. |
| **Primary color** | Main color of your product (buttons, headers) | `#1a73e8` (Google blue) | Click the color box to open a color picker, or type a hex code |
| **Secondary color** | Accent color | `#34a853` (green) | Pick something complementary |
| **Accent color** | Highlight color for special elements | `#ea4335` (red) | Pick a third color |

**My recommendation:** Leave the colors as-is for now. You can change them later.

---

#### CARD 3: Data Sources

This is WHERE your product gets its data from. At least 1 source is required.

**Pre-filled:** Usually 1-2 sources based on your idea.

Each source has:

| Field | What It Means | What To Enter |
|-------|--------------|--------------|
| **Type** (dropdown) | How the data is collected | Pick from the list below |
| **Rate limit (per hour)** | How many times per hour to check for new data | `60` is fine (once per minute) |
| **Endpoint URL** | The web address to pull data from (shown for HTTP API, Web Scrape, RSS, PDF types) | Enter a real URL or a placeholder like `https://api.example.com/prices` |
| **Authentication required** (checkbox) | Does this data source need a login/API key? | Check if yes |

**Data Source Types Explained:**

| Type | What It Does | Example Use |
|------|-------------|-------------|
| **HTTP API (REST polling)** | Calls a web API to get data | Pulling prices from an API |
| **Web scrape** | Reads a web page and extracts data | Scraping competitor websites |
| **RSS feed** | Follows a news/blog feed | Monitoring industry news |
| **Email inbound** | Receives data via incoming emails | Customers forwarding reports |
| **CSV upload** | Users upload spreadsheet files | Manual data imports |
| **Google Sheets** | Pulls data from a Google spreadsheet | Shared team data |
| **PDF watch** | Monitors a PDF URL for changes | Watching regulatory documents |

**To add another source:** Click *"+ Add another data source"*
**To remove a source:** Click *"Remove"* on that source

---

#### CARD 4: Alert Primitives

These are the **types of alerts** your customers can create. Check the ones you want.

| Alert Type | What It Does | Example | Recommended? |
|-----------|-------------|---------|-------------|
| **Threshold** | Alert when a value goes above or below a number | "Alert me if price goes above €50" | YES - most useful |
| **Change rate** | Alert when a value changes by a percentage | "Alert me if price changes more than 10%" | YES - very useful |
| **Absence** | Alert when expected data stops arriving | "Alert me if no data for 24 hours" | YES |
| **Presence** | Alert when specific data appears | "Alert me when a new product is listed" | Useful |
| **Regex match** | Alert when text matches a pattern | "Alert me when text contains 'recall'" | For technical users |
| **Semantic match (LLM)** | AI-powered matching of meaning | "Alert me about bankruptcy-related news" | Advanced, costs more |
| **Statistical anomaly** | Alert on unusual patterns | "Alert me on unexpected spikes" | Advanced |
| **Deadline approaching** | Alert before a date/time passes | "Alert me 7 days before contract expires" | Useful for contracts |

**My recommendation:** Check **Threshold**, **Change rate**, **Absence**, and **Presence**. These cover 90% of use cases.

---

#### CARD 5: Notification Channels

HOW your customers receive alerts. Check the ones you want.

| Channel | What It Is | Recommended? |
|---------|-----------|-------------|
| **Email** | Alert sent to their email inbox | YES - always enable this |
| **Slack** | Alert posted to a Slack channel | Good for teams |
| **Webhook** | Alert sent to a custom URL (for developers) | For technical users |
| **SMS** | Text message alert | Good for urgent alerts |
| **WhatsApp** | WhatsApp message | Popular in DACH region |
| **In-app** | Alert shown inside the product dashboard | YES |
| **Microsoft Teams** | Alert posted to Teams | For corporate users |
| **Telegram** | Telegram message | Good for tech-savvy users |

**My recommendation:** Check **Email** and **In-app** at minimum. Add **Slack** if your customers are businesses.

---

#### CARD 6: Pricing Tiers

Set the pricing plans for your customers. Pre-filled with 3 tiers usually.

**Each tier has:**

| Field | What It Means | Example Values |
|-------|--------------|---------------|
| **Name** | Plan name | `Free`, `Starter`, `Pro` |
| **Monthly price (€)** | What the customer pays per month | `0`, `19`, `49` |
| **Annual discount %** | Discount for yearly payment | `17` (means 17% off if they pay yearly) |

**Each tier also has LIMITS** (what customers on this plan can do):

| Limit | What It Controls | Free Example | Starter Example | Pro Example |
|-------|-----------------|-------------|----------------|-------------|
| **Sources** | Max data sources they can add | `1` | `5` | `20` |
| **Rules** | Max alert rules they can create | `3` | `20` | `100` |
| **Check (min)** | How often data is checked (minutes) | `1440` (=daily) | `60` (=hourly) | `5` (=every 5 min) |
| **History (days)** | How many days of data they can see | `7` | `90` | `365` |
| **Team** | How many team members | `1` | `3` | `10` |

**To add a tier:** Click *"+ Add pricing tier"* (max 4 tiers)
**To remove a tier:** Click *"Remove"* on that tier

**My recommendation:** Keep the 3 pre-filled tiers (Free / Starter / Pro). The defaults from the AI are sensible.

---

#### CARD 7: Integrations & Onboarding

**Integrations** — Third-party services to connect. Check any you want:

| Integration | What It Does |
|------------|-------------|
| **Stripe** | Payment processing (highly recommended!) |
| **SendGrid** | Email delivery service |
| **Postmark** | Email delivery service (alternative to SendGrid) |
| **Slack** | Slack integration for notifications |
| **Zapier** | Connect to 5000+ apps |
| **Make** | Automation platform (like Zapier) |
| **n8n** | Open-source automation |
| **Google Workspace** | Google Docs, Sheets, etc. |

**Onboarding mode** — How new customers get started with your product:

| Mode | What It Means | Best For |
|------|--------------|---------|
| **Self-serve** | Customers figure it out on their own | Simple products, technical users |
| **Guided wizard** | Step-by-step setup walkthrough | Most products (recommended) |
| **Done-for-you** | You (or AI) set everything up for the customer | Premium/expensive products |

**My recommendation:** Check **Stripe**. Select **Guided wizard** for onboarding.

---

#### THE BIG BUTTON AT THE BOTTOM:

You'll see a section titled **"Dispatch to Build Orchestrator"** with two buttons:

- **Cancel** — Goes back to Dashboard without saving
- **"Dispatch build"** (blue button with rocket icon) — **THIS STARTS THE BUILD!**

**When you click "Dispatch build":**
1. The button changes to *"Dispatching..."*
2. The form is validated (if something's wrong, you'll see red error messages)
3. If everything's valid, you're redirected to the **Build Pipeline** page

---

## SCREEN 4: Build Pipeline — Watch It Being Built

### How You Got Here:
You clicked "Dispatch build" on the BuildSpec form.

### What You See:
Your product going through **11 automated steps**. Each step takes about 90 seconds.

```
Step  1: Schema Validation           [===== DONE =====]  ✓
Step  2: Product Registry            [===== DONE =====]  ✓
Step  3: Infrastructure Provisioning [===== DONE =====]  ✓
Step  4: Product Repo Init           [=======>         ]  IN PROGRESS
Step  5: Data Source Config           [                 ]  waiting...
Step  6: Alert Primitive Wiring       [                 ]  waiting...
Step  7: Onboarding Flow Generation   [                 ]  waiting...
Step  8: Marketing Site Generation    [                 ]  waiting...
Step  9: Knowledge Base Init          [                 ]  waiting...
Step 10: Integration Test Suite       [                 ]  waiting...
Step 11: LAUNCH APPROVAL              [                 ]  NEEDS YOU!
```

### What Each Step Does:

| Step | Name | What The AI Does | Time |
|------|------|-----------------|------|
| 1 | Schema Validation | Checks your BuildSpec is valid and complete | ~90 sec |
| 2 | Product Registry | Creates the product entry in the database | ~90 sec |
| 3 | Infrastructure | Sets up servers and database tables for your product | ~90 sec |
| 4 | Product Repo Init | Creates the code structure for your product | ~90 sec |
| 5 | Data Source Config | Connects to your data sources and does a test fetch | ~90 sec |
| 6 | Alert Primitive Wiring | Sets up the alert system with your chosen alert types | ~90 sec |
| 7 | Onboarding Flow | Creates the customer signup and setup wizard | ~90 sec |
| 8 | Marketing Site | Generates a landing page for your product | ~90 sec |
| 9 | Knowledge Base | Creates help docs and FAQ for your product | ~90 sec |
| 10 | Integration Tests | Runs tests to make sure everything works | ~90 sec |
| 11 | **LAUNCH APPROVAL** | **STOPS and waits for YOU to approve** | Your decision |

### What To Do:

**Nothing! Just wait (or go get coffee).**

- Steps 1-10 run automatically — about 15 minutes total
- The page updates as each step completes
- You can refresh the page to see progress
- **Step 11 will STOP and wait for your manual approval**

### When All 10 Steps Are Done:

You'll see step 11 waiting. Now go to the **Launch Approval** page.

---

## SCREEN 5: Launch Approval — Go Live!

### How To Get Here:
Click **"Launch Approval"** in the sidebar. (Or you might see a notification on the Dashboard.)

### What You See:
A list of products that finished building and need your sign-off.

Your product should appear with:
- Product name and slug
- *"Steps 1-10 passed"*
- Estimated monthly operating cost
- A **"Review →"** link

### What To Do:

1. Click **"Review →"** (or the approve button)
2. Review the build summary — everything should show as complete
3. Click **"Approve Launch"**

### What Happens:

- Your product status changes from `building` to **`live`**
- The product is now accessible at `/product/your-slug`
- Customers can sign up!
- You'll see it on your Dashboard under "Live products: 1"

---

## SCREEN 6: Your Product Is Live! — Test It As A Customer

### How To Access Your Product:

Open a **new browser tab** (or an incognito/private window) and go to:

```
http://localhost:3000/product/YOUR-SLUG-HERE
```

Replace `YOUR-SLUG-HERE` with the slug you chose (e.g., `price-monitor`).

### What You See:

A login/signup page with:
- Your product name at the top
- *"Monitoring-SaaS"* subtitle
- Two tabs: **Sign In** | **Sign Up**

### Create A Test Customer Account:

1. Click the **"Sign Up"** tab
2. Fill in:
   - **Name**: `Test Customer` (or anything)
   - **Email**: `customer@test.com` (or any email)
   - **Password**: `password123` (8+ characters — simpler rules than operator account!)
3. Click **"Create Account"**
4. You're in the **customer dashboard!**

### What The Customer Dashboard Shows:

- KPI cards (empty at first)
- Data sources (none added yet)
- Recent alerts (none triggered yet)
- Observations (no data collected yet)

---

## WHAT TO EXPLORE NEXT (After Your First Product Is Live)

Now that you've completed the main flow, here are the other features to explore:

### Outreach Queues (Marketing Your Product)

**Sidebar → Outreach Queues**

Generate marketing content for your product:
- **Core Message** — AI creates your marketing message in 3 tones (calm, pointed, provocative)
- **Meta Ads** — AI structures a Facebook/Instagram ad campaign
- **Email Sequences** — AI creates onboarding and engagement emails
- **Social Posts** — AI creates social media content

### Compliance Gates (Legal Requirements)

**Sidebar → Compliance Gates**

A checklist of legal requirements you need to complete before going live with real customers in Europe:
- 18 GDPR/DSGVO checks (privacy, cookies, data handling)
- 6 Email compliance checks (DKIM, double opt-in, etc.)
- 1 Content check (no forbidden claims)
- 2 Audit checks (logging, cost tracking)

### Audit Trail (Tracking Every Action)

**Sidebar → Audit Trail**

See every AI action that happened:
- Which AI agent ran (Architect, Build Orchestrator, Content, etc.)
- What task it performed
- How much it cost (in EUR)
- Whether it succeeded or failed
- Which AI model was used

### Templates

**Sidebar → Templates**

See the product templates available:
- **V1 (Active):** Monitoring-SaaS — the one you just used
- **V2 (Coming Soon):** Workflow-Automation-SaaS, Data-Enrichment-API, Dashboard-Reporting-SaaS

### Patterns

**Sidebar → Patterns**

Browse 10 reusable building blocks:
- Email Digest, CSV Import/Export, Webhook Receiver, API Poller
- LLM Extract, Approval Queue, Timeline View, Onboarding Wizard
- Scheduled Report, Slack Integration

### Settings

**Sidebar → Settings**

View and manage:
- Your account information (name, email, company)
- Your subscription tier (Free / Starter / Pro)
- Billing details

---

## QUICK REFERENCE: The Complete User Journey

```
 YOU JUST LOGGED IN
       |
       v
 [Dashboard] — See overview (everything empty)
       |
       v
 [Idea Inbox] — Click "Generate 3 ideas"
       |         Fill in: verticals, region, budget, notes
       |         Click "Generate 3 ideas" button
       |         Wait 10-30 seconds
       v
 [Read 3 Ideas] — Pick the best one
       |           Click "Promote to BuildSpec"
       v
 [BuildSpec Form] — Review/edit pre-filled fields
       |             Product identity, branding, data sources,
       |             alerts, channels, pricing, integrations
       |             Click "Dispatch build"
       v
 [Build Pipeline] — Watch 11 steps run (~15 minutes)
       |             Steps 1-10 are automatic
       |             Step 11 waits for you
       v
 [Launch Approval] — Click "Approve Launch"
       |
       v
 YOUR PRODUCT IS LIVE!
       |
       v
 [Test it] — Open /product/your-slug in new tab
       |       Sign up as a test customer
       v
 [Marketing] — Use Outreach Queues to generate ads, emails
       |
       v
 [Legal] — Complete Compliance Gates
       |
       v
 [Monitor] — Check Audit Trail for costs and activity
```

---

## COMMON QUESTIONS

**Q: How much does it cost to generate ideas?**
A: About €0.05 per generation (3 ideas). You'll see the exact cost in the green success message.

**Q: How much does building a product cost?**
A: About €0.50 total for all 11 steps combined.

**Q: Can I go back and change things?**
A: You can generate more ideas anytime. You can create new BuildSpecs. But once a build is dispatched, those 11 steps run automatically.

**Q: What if I made a mistake in the BuildSpec?**
A: You can create a new BuildSpec with corrected settings. Each build creates a separate product.

**Q: Is this using real money?**
A: If `MOCK_PROVIDERS=true` (testing mode), no real money is spent. All AI calls are simulated. If using real API keys, small amounts of EUR are spent on each AI operation.

**Q: How do my customers pay?**
A: Through Stripe. When Stripe is configured, customers can subscribe to your pricing tiers directly.

**Q: Where is my data stored?**
A: In your PostgreSQL database. All data (users, products, alerts, observations) is stored there.

**Q: Can I delete a product?**
A: Products can be paused or killed from the Portfolio Control page, but the data is preserved for audit purposes.
