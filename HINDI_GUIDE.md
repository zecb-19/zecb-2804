# ZECB — Complete Application Guide (Hindi)

---

## Yeh Application Kya Hai?

### Seedhi Baat

Socho tumhare paas ek business idea hai — jaise Amazon pe competitor ke prices track karna, ya government ki nayi policies monitor karna — lekin tumhare paas koi team nahi hai software banane ke liye.

**ZECB yeh software TUMHARE LIYE bana deta hai, automatically, 72 ghante ke andar.**

Isko aise socho — yeh ek **factory hai jo chhoti-chhoti software companies banati hai**. Tum batao kya monitor karna hai, yeh poora product bana dega — website, user accounts, alerts, emails, legal pages — sab kuch. Aur phir real customers sign up karke tumhare product ke liye pay kar sakte hain.

---

## Yeh Application Kiske Liye Hai?

- Solo founders jo apna SaaS (Software as a Service) business launch karna chahte hain
- Europe ke small business owners (Germany, Austria, Switzerland)
- Koi bhi jo bina developers hire kiye software business chalana chahta hai

---

## Application Ka Poora Flow (Step by Step)

```
TUMHARE PAAS EK IDEA HAI
       |
       v
  [1] AI ko apna idea batao (ya AI se ideas generate karwao)
       |
       v
  [2] Inbox mein se apna favourite idea chuno
       |
       v
  [3] "BuildSpec" bharo (ek form jo tumhare product ki details maangta hai)
       |
       v
  [4] "Build" pe click karo — system 11 automated steps chalata hai (~15 minute)
       |
       v
  [5] Review karo aur launch approve karo
       |
       v
  [6] Tumhara product LIVE ho gaya! Real customers sign up kar sakte hain
       |
       v
  [7] System marketing emails, legal compliance, alerts — sab handle karta hai
```

---

## Real Example Samjho

Maan lo tum **"Amazon Sellers ke liye Price Monitor"** banana chahte ho:

1. Tum ZECB ko bolte ho: *"Mujhe Germany ke Amazon sellers ke liye competitor prices track karne hain"*
2. AI 3 alag-alag ideas generate karta hai pricing suggestions ke saath (Free / €19/month / €49/month)
3. Tum sabse accha idea choose karte ho aur details bharte ho (kya monitor karna hai, kitni baar, kaise alert dena hai)
4. ZECB automatically build karta hai:
   - Tumhare customers ke liye **sign-up page**
   - Ek **dashboard** jahan customers price changes dekh sakein
   - **Alert rules** (jaise "mujhe batao agar price 10% se zyada gire")
   - **Email notifications**
   - **Legal pages** (Privacy Policy, Terms of Service — Germany mein zaroori hai)
   - **Stripe payment** integration (paise lene ke liye)
5. Tum launch approve karte ho, aur tumhara product live ho jaata hai

---

## Application Mein Do Tarah Ke Users Hain

### 1. Operator (TUM — Business Owner)

Tum wo insaan ho jo product bana raha hai aur manage kar raha hai.

**Tumhara Dashboard:** `http://localhost:3003/dashboard`

Yahan se tum:
- Ideas generate karte ho
- Products build karte ho
- Launches approve karte ho
- Marketing content banate ho
- Legal compliance check karte ho
- Paise ka hisaab dekhte ho (Audit Trail)

### 2. Tenant (TUMHARA CUSTOMER)

Yeh wo insaan hai jo TUMHARE product ka use karta hai. Jaise agar tum Amazon Price Monitor banao, toh Amazon seller tumhara customer hai.

**Customer ka Dashboard:** `http://localhost:3003/product/buybox-watcher-amazon-de/dashboard`

Yahan se customer:
- Data sources add karta hai (kahan se data aayega)
- Alert rules banata hai (kab notification aaye)
- Observations dekhta hai (kya data aaya)
- Alerts dekhta hai (kaunse rules trigger hue)
- Settings change karta hai

---

## Sidebar Menu — Har Link Ka Matlab

### BUILD Section (Products banane ke liye)

| Link | Kya Karta Hai | Kab Use Karo |
|------|--------------|-------------|
| **Dashboard** | Home screen — sab kuch ek nazar mein | Jab overview chahiye |
| **Idea Inbox** | AI tumhare liye business ideas generate karta hai | **SABSE PEHLE YAHAN JAO** |
| **BuildSpec Authoring** | Product configure karne ka form | Idea choose karne ke baad |
| **Build Pipeline** | 11 steps mein product banta dekho | BuildSpec submit karne ke baad |
| **Launch Approval** | Build complete hone pe approve karo | Jab 11 steps complete hon |

### OPERATE Section (Live products manage karne ke liye)

| Link | Kya Karta Hai | Kab Use Karo |
|------|--------------|-------------|
| **Portfolio Control** | Saare live products ek jagah | Jab live products hon |
| **Outreach Queues** | Marketing content banao — emails, ads, social posts | Jab customers chahiye |
| **Audit Trail** | Har AI action ka log aur uska cost | Jab kharcha dekhna ho |

### CATALOG Section (Building blocks)

| Link | Kya Karta Hai | Kab Use Karo |
|------|--------------|-------------|
| **Templates** | Product ke blueprints (abhi: Monitoring-SaaS) | Dekhne ke liye kya available hai |
| **Patterns** | Reusable components jaise "Email Digest", "CSV Import" | Building blocks samajhne ke liye |

### SYSTEM Section (Admin & Settings)

| Link | Kya Karta Hai | Kab Use Karo |
|------|--------------|-------------|
| **Compliance Gates** | Legal checkboxes (GDPR/DSGVO compliance) | Real customers ko serve karne se pehle |
| **Admin** | System administration | Usually zaroorat nahi padti |
| **Settings** | Account info, billing, subscription | Apni info change karne ke liye |

---

## Idea Generation — Kya Bharna Hai

Jab tum **Idea Inbox** mein jaate ho, ek form dikhta hai. Har field ka matlab:

### Field 1: "Target verticals or angles" (ZAROORI)

**Simple mein:** Kis industry ke liye product banana hai?

**Examples:**
- `e-commerce sellers tracking competitor prices in Germany`
- `restaurants monitoring supplier prices in DACH region`
- `real estate agents tracking property listings in Austria`

### Field 2: "Region" (DROPDOWN)

**Simple mein:** Customers kahan ke hain?

| Option | Matlab |
|--------|--------|
| **DE** | Sirf Germany |
| **AT** | Sirf Austria |
| **CH** | Sirf Switzerland |
| **DACH** | Germany + Austria + Switzerland |
| **EU** | Poora Europe |

### Field 3: "Operator monthly opex cap (€)" (NUMBER)

**Simple mein:** Product chalane mein tumhe mahine ka kitna kharcha afford hai? (Server costs, AI costs, etc.)

Default: `500` (matlab €500/month). Yeh tumhara kharcha hai, customer ki price nahi.

### Field 4: "Constraints" (OPTIONAL)

**Simple mein:** AI ko koi extra instruction dena hai?

Example: `avoid price-monitoring ideas, prefer compliance-related`

### Button: "Generate 3 ideas"

Click karo, 10-30 second ruko, 3 ideas aayengi.

---

## Idea Card Mein Kya Dikhta Hai

Har idea card mein yeh information hoti hai:

| Term | Matlab | Acchi Value |
|------|--------|------------|
| **CAC** (Customer Acquisition Cost) | Ek customer paane mein kitna kharcha | Kam ho toh accha. €100 se kam accha. |
| **LTV** (Lifetime Value) | Ek customer poori life mein kitna paisa dega | Zyada ho toh accha. €300+ accha. |
| **Payback** | Kitne mahine mein CAC wapas aayega | Kam ho toh accha. 6 mahine se kam great. |
| **Confidence** | AI ko kitna bharosa hai in numbers pe | `high` > `medium` > `low` |

### Idea pe 3 Buttons:

| Button | Kya Karta Hai | Kab Click Karo |
|--------|-------------|---------------|
| **Reject** | Idea reject karo | Idea pasand nahi aayi |
| **Approve** | Save kar lo baad ke liye | Acchi hai lekin abhi build nahi karna |
| **Promote to BuildSpec** | Iss idea se product banao! | **SABSE ACCHI idea pe yeh click karo** |

---

## BuildSpec Form — Har Card Ka Matlab

### Card 1: Product Identity
- **Product slug** — URL name (jaise `price-monitor`). Lowercase, hyphens allowed.
- **Product name** — Display name jo customers ko dikhega
- **Tagline** — One-line marketing phrase (max 140 characters)

### Card 2: Branding
- **Brand name** — Logo ke jagah dikhne wala name
- **Logo URL** — Agar logo hai toh uska link. Nahi hai toh blank chhodo.
- **Colors** — Primary, Secondary, Accent colors. Default chhod do.

### Card 3: Data Sources
Tumhara product DATA kahan se laayega:

| Type | Kya Karta Hai | Example |
|------|-------------|---------|
| **HTTP API** | Kisi website/API se data pull karta hai | Amazon API se prices lena |
| **Web Scrape** | Web page padhke data nikalta hai | Competitor ki website scrape karna |
| **RSS Feed** | News/blog feed follow karta hai | Industry news monitor karna |
| **Email Inbound** | Email se data aata hai | Customers reports forward karen |
| **CSV Upload** | Spreadsheet upload karte hain | Manual data import |
| **Google Sheets** | Google Spreadsheet se data | Shared team data |
| **PDF Watch** | PDF file mein changes dekhta hai | Government documents monitor karna |

### Card 4: Alert Primitives
Customer KAUNSE types ke alerts bana sakta hai:

| Alert Type | Kya Karta Hai | Example |
|-----------|-------------|---------|
| **Threshold** | Value ek number se upar/neeche jaaye | "Price €50 se upar jaaye toh batao" |
| **Change Rate** | Value percentage se zyada badle | "Price 10% se zyada badle toh batao" |
| **Absence** | Data aana band ho jaaye | "24 ghante se data nahi aaya toh batao" |
| **Presence** | Specific data dikhe | "Naya product list ho toh batao" |
| **Regex Match** | Text ek pattern match kare | "Text mein 'recall' aaye toh batao" |
| **Semantic Match** | AI se meaning match kare | "Bankruptcy jaisi news aaye toh batao" |

### Card 5: Notification Channels
Customer ko KAISE alert milega:

| Channel | Kya Hai |
|---------|--------|
| **Email** | Email pe alert (HAMESHA enable karo) |
| **Slack** | Slack channel mein message |
| **SMS** | Text message |
| **WhatsApp** | WhatsApp pe message |
| **In-app** | Dashboard mein notification |

### Card 6: Pricing Tiers
Customer se KITNE paise loge:

| Tier | Example Price | Limits |
|------|-------------|--------|
| **Free** | €0/month | 1 data source, daily check, 7 days history |
| **Starter** | €19/month | 5 sources, hourly check, 90 days history |
| **Pro** | €49/month | 20 sources, 5 min check, 365 days history |

### Card 7: Integrations & Onboarding
- **Integrations** — Stripe (payments), Slack, Zapier, etc.
- **Onboarding Mode** — Customer kaise start karega:
  - **Self-serve** — Khud samajh le
  - **Guided wizard** — Step by step guide (RECOMMENDED)
  - **Done-for-you** — Tum sab set karke do

### Bottom Button: "Dispatch build"
Yeh click karte hi product BANNA shuru ho jaata hai!

---

## Build Pipeline — 11 Steps

Har step ~90 seconds leta hai. Total ~15 minutes.

| Step | Naam | AI Kya Karta Hai |
|------|------|-----------------|
| 1 | Schema Validation | BuildSpec sahi hai ya nahi check karta hai |
| 2 | Product Registry | Database mein product ka entry banata hai |
| 3 | Infrastructure | Servers aur database tables set karta hai |
| 4 | Product Repo Init | Product ka code structure banata hai |
| 5 | Data Source Config | Data sources connect karke test karta hai |
| 6 | Alert Wiring | Alert system set karta hai |
| 7 | Onboarding Flow | Customer ka signup aur setup wizard banata hai |
| 8 | Marketing Site | Product ki landing page banata hai |
| 9 | Knowledge Base | Help docs aur FAQ banata hai |
| 10 | Integration Tests | Sab kuch sahi kaam kar raha hai test karta hai |
| 11 | **LAUNCH APPROVAL** | **TUMSE PUCHTA HAI — approve karoge?** |

Steps 1-10 AUTOMATICALLY chalte hain. Step 11 pe system RUKTA HAI tumhare approval ka wait karta hai.

---

## Customer Dashboard — Kya Dekhta Hai Customer

Jab tum `http://localhost:3003/product/buybox-watcher-amazon-de/dashboard` pe ho, yeh TUMHARE CUSTOMER ka view hai.

### 6 KPI Cards:

| Card | Matlab |
|------|--------|
| **Data Sources** | Kitne data sources connected hain |
| **Observations** | Total kitne data points collect hue |
| **Today (Observations)** | Aaj kitne data points aaye |
| **Alert Rules** | Customer ne kitne alert rules banaye hain |
| **Alerts (Total)** | Total kitni alerts trigger hui |
| **Today (Alerts)** | Aaj kitni alerts aayi |

### Navigation Tabs:

| Tab | Customer Yahan Kya Karta Hai |
|-----|------------------------------|
| **Dashboard** | Overview dekhta hai (abhi yahan ho) |
| **Rules** | Alert rules banata hai — jaise "price 10% badle toh batao" |
| **Timeline** | Saare collected data points time ke hisaab se dekhta hai |
| **Alerts** | Saari triggered notifications dekhta hai |
| **Settings** | Notification preferences change karta hai |

### Sab 0 Kyun Dikh Raha Hai?

Product abhi naya hai. Real mein:
1. Tum (operator) build ke time data sources configure karte
2. Customers alert rules banate
3. System schedule pe data collect karta
4. Jab data kisi rule se match karta hai, alert fire hota hai

---

## Do Dashboard Ka Fark Samjho

```
+--------------------------------------------------+
|                                                  |
|  /dashboard                                      |
|  = TUMHARA (Operator) dashboard                  |
|  = Yahan se tum PRODUCTS BANATE HO               |
|  = Yeh tum dekhte ho, customer nahi              |
|                                                  |
+--------------------------------------------------+
                    |
                    | Tum product banate ho
                    |
                    v
+--------------------------------------------------+
|                                                  |
|  /product/buybox-watcher-amazon-de/dashboard     |
|  = TUMHARE CUSTOMER (Tenant) ka dashboard        |
|  = Yahan CUSTOMER data monitor karta hai          |
|  = Yeh customer dekhta hai, tum nahi (normally)  |
|                                                  |
+--------------------------------------------------+
```

**Operator Dashboard** = Factory ka control room (tum)
**Product Dashboard** = Factory se bani hui car (customer chalata hai)

---

## Audit Trail — Kya Hai

**Sidebar → Audit Trail**

Yeh tumhare business ka HISAAB KITAAB hai. Har ek AI action ka record:

| Column | Kya Dikhata Hai |
|--------|----------------|
| **Timestamp** | Kab hua |
| **Agent** | Kaunse AI ne kiya (Build Orchestrator, Content Agent, etc.) |
| **Task** | Kya kiya (schema_validation, marketing_site_generation, etc.) |
| **Status** | Kaamyaab hua ya fail (green = ok, red = failed) |
| **Product** | Kis product ke liye tha |
| **Cost** | Kitne paise lage EUR mein (jaise €0.0150) |

**Kisi bhi row pe click karo** — expand hoke dikhata hai:
- **Input** — AI ko kya data mila
- **Output** — AI ne kya result diya
- **Model** — Kaunsa AI model use hua

---

## Compliance Gates — Kya Hai

**Sidebar → Compliance Gates**

Europe mein (especially Germany mein) business karne ke liye kuch legal rules follow karne padte hain. Yeh ek CHECKLIST hai:

| Category | Kitne Checks | Kya Hai |
|----------|-------------|---------|
| **DSGVO (GDPR)** | 18 checks | Privacy, cookies, data handling |
| **Email** | 6 checks | DKIM, double opt-in, unsubscribe |
| **Cold Email** | 8 checks | B2B cold email rules |
| **Content** | 1 check | Marketing mein banned phrases na hon |
| **Audit** | 2 checks | Logging sahi ho (yeh already complete hain) |

---

## Outreach — Kya Hai

**Sidebar → Outreach Queues**

AI tumhare liye MARKETING CONTENT banata hai:

| Feature | Kya Banata Hai |
|---------|---------------|
| **Core Message** | Tumhare product ki main marketing message — 3 styles mein (calm, pointed, provocative) |
| **Meta Ads** | Facebook/Instagram ads ka campaign structure |
| **Email Sequences** | Onboarding aur engagement emails |
| **Social Posts** | Twitter/LinkedIn/TikTok ke liye content |

---

## Paise Ka Hisaab

| Action | Approximate Cost |
|--------|-----------------|
| 3 ideas generate karna | ~€0.05 |
| Poora product build (11 steps) | ~€0.50 |
| Core message generate karna | ~€0.05 |
| Meta Ads campaign generate karna | ~€0.10 |

Sab costs **Audit Trail** mein dikhtey hain.

Agar `MOCK_PROVIDERS=true` hai (.env.local mein), toh koi real paisa nahi lagta — sab simulated hai.

---

## Important URLs

| URL | Kya Hai |
|-----|---------|
| `/` | Landing page (public) |
| `/dashboard` | Tumhara (operator) control panel |
| `/dashboard/inbox` | AI idea generator |
| `/dashboard/buildspec` | Product configuration form |
| `/dashboard/pipeline` | Build progress tracker |
| `/dashboard/launches` | Launch approval queue |
| `/dashboard/outreach` | Marketing tools |
| `/dashboard/compliance` | Legal compliance checklist |
| `/dashboard/audit` | Cost & activity log |
| `/product/[slug]` | Customer login page |
| `/product/[slug]/dashboard` | Customer dashboard |

---

## Glossary — Terms Ka Matlab

| Term | Hindi Mein |
|------|-----------|
| **Operator** | Tum — product banane aur manage karne wala |
| **Tenant** | Tumhara customer jo tumhare product ka use karta hai |
| **BuildSpec** | Product ka blueprint / configuration form |
| **Pipeline** | 11-step automated build process |
| **HITL** | "Human In The Loop" — jahan insaan ko approve karna padta hai |
| **OpEx** | Operating Expenses — chalane ka kharcha |
| **DSGVO** | German mein GDPR (data privacy law) |
| **Slug** | Product ka URL-friendly naam (jaise `price-monitor`) |
| **Agent Run** | AI ka ek task execute karna (jaise idea generate karna) |
| **Data Source** | Jahan se product data laata hai |
| **Alert Rule** | Condition jo customer set karta hai notification ke liye |
| **Observation** | Ek data point jo data source se collect hua |
| **Pattern** | Reusable building block (jaise "Email Digest") |
| **Template** | Complete product blueprint (jaise "Monitoring-SaaS") |
| **SaaS** | Software as a Service — software jo monthly subscription pe milta hai |
| **CAC** | Customer Acquisition Cost — ek customer paane ka kharcha |
| **LTV** | Lifetime Value — ek customer se poori life mein kitna paisa aayega |
| **DACH** | Germany (D) + Austria (A) + Switzerland (CH) |

---

## Ek Line Mein Poora Summary

**ZECB ek aisi application hai jahan tum apna SaaS business idea batate ho, AI poora product build kar deta hai 15 minute mein, aur phir real customers sign up karke tumhe monthly pay karte hain — bina kisi employee ke.**
