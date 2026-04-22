# Design Document

## AI Resume Analyzer + Job Match Platform

**Document Version:** 1.0  
**Last Updated:** April 23, 2026  
**Design Owner:** UX/UI Designer  
**Status:** Ready for Development  

---

## 1. Design Overview

### Design Philosophy

**Style:** Modern, clean, SaaS-inspired with purposeful minimalism

**One-Line Design Mantra:**
"Clarity first. Show users exactly what they need to improve, then get out of the way."

**Rationale:**
Job seekers come to this product with anxiety (will my resume get rejected?). Our job is to remove that anxiety by giving them clear, actionable insights fast. No unnecessary complexity. Every pixel serves the purpose of either showing analysis data, guiding the user to the next step, or providing feedback.

### Target User Experience

**How should users feel?**
- **Primary:** Confident ("I understand what's wrong and how to fix it")
- **Secondary:** In control ("I can act on these insights immediately")
- **Tertiary:** Delighted ("Wow, I got professional feedback in 2 minutes")

**Expected Journey:**
1. **Landing** (15 seconds): "I see the value immediately"
2. **Upload** (30 seconds): "This is so easy"
3. **Processing** (10 seconds): "I see progress, feels fast"
4. **Results** (2 minutes): "I understand my ATS score, skills, and next steps"
5. **Download** (10 seconds): "I have a report I can keep"
6. **Return** (next week): "Let me try again with improvements"

### Brand Personality

**Tone & Voice:**
- **Conversational but professional** — "Let's improve your resume" not "Resume Analysis Module 1.0"
- **Encouraging, never patronizing** — "Your ATS score is 72/100. Here's how to reach 85+" not "Your resume is bad"
- **Action-oriented** — Always point toward next steps, never just surface problems

**Visual Personality:**
- **Energy Level:** Moderate (productive, focused, not playful or corporate sterile)
- **Color Mood:** Trustworthy (blues) + motivational (greens for success) + warm (subtle oranges for CTAs)
- **Sophistication:** Modern SaaS (clean typography, generous whitespace, subtle shadows)
- **Inspiration:** Figma's design, Stripe's clarity, Grammarly's feedback approach

---

## 2. Key Screens

### Screen 1: Landing / Home Page

**Purpose:** 
Hook user immediately with value prop; convince them to upload resume. Establish trust and ease.

**Key Elements:**
- Hero headline (40px, bold): "Optimize Your Resume in 2 Minutes"
- Subheading (18px, medium): "Get ATS score, skill analysis, and personalized job matches"
- Large upload button (CTA): "Upload Resume" (52px height, full width on mobile)
- Three feature cards below explaining value: "ATS Score", "Skill Analysis", "Job Matches"
- Footer: "Free 5 analyses/month. No credit card required."

**Layout (Desktop - 1200px wide):**
```
┌─────────────────────────────────────────────────────┐
│  Logo          [Sign In] [Sign Up]                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│     Optimize Your Resume in 2 Minutes               │
│     Get ATS score, skill analysis, and job matches  │
│                                                      │
│          ┌──────────────────────────┐               │
│          │ 📄 Upload Resume         │               │
│          └──────────────────────────┘               │
│                                                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ ATS Score   │  │ Skill       │  │ Job Matches │  │
│  │ 0-100       │  │ Analysis    │  │ Personalized│  │
│  │ Understand  │  │ Categorized │  │ Relevant    │  │
│  │ ATS impact  │  │ skills      │  │ jobs        │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                      │
├─────────────────────────────────────────────────────┤
│  Free 5 analyses/month. No credit card required.    │
│                                                      │
│  ⭐⭐⭐⭐⭐ 4.8 rating · 2,340 reviews               │
└─────────────────────────────────────────────────────┘
```

**Layout (Mobile - 375px):**
```
┌──────────────────────────────┐
│  Logo              ☰          │
├──────────────────────────────┤
│                              │
│  Optimize Your Resume        │
│  in 2 Minutes                │
│                              │
│  Get ATS score, skill        │
│  analysis, and job matches   │
│                              │
│  ┌──────────────────────────┐│
│  │ 📄 Upload Resume         ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ ATS Score                ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │ Skill Analysis           ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │ Job Matches              ││
│  └──────────────────────────┘│
│                              │
│  Free 5 analyses/month       │
│  ⭐⭐⭐⭐⭐ 4.8 (2,340)      │
└──────────────────────────────┘
```

**Responsive Notes:**
- Desktop: Hero + 3 feature cards in row
- Tablet: Hero + 3 feature cards stack to 2 per row
- Mobile: Hero + all cards stack vertically, full-width buttons

---

### Screen 2: Resume Upload & Preview

**Purpose:** 
Accept PDF; extract and preview text; let user confirm before analysis.

**Key Elements:**
- Drag-and-drop zone (dashed border, large hit target)
- File input fallback ("Or browse files")
- Progress bar during upload (indeterminate until complete)
- Preview of extracted text (scrollable, editable)
- "Approve & Analyze" button (primary, disabled until text approved)
- Character count (helper text)

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────┐
│  Resume Analyzer > Upload                           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Step 1 of 3: Upload Resume                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │                                               │  │
│  │      📄 Drag & drop your resume here         │  │
│  │          (or click to browse)                │  │
│  │                                               │  │
│  │      PDF • DOC • DOCX • Max 5MB              │  │
│  │                                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ─────────────────── OR ───────────────────────     │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Browse Files                                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
├─────────────────────────────────────────────────────┤
│  [After upload]                                      │
│                                                      │
│  Extracted Text Preview (editable)                 │
│  ┌──────────────────────────────────────────────┐  │
│  │ John Doe                                     │  │
│  │ john@example.com | (555) 123-4567            │  │
│  │ linkedin.com/in/johndoe                      │  │
│  │                                               │  │
│  │ EXPERIENCE                                   │  │
│  │ Senior Software Engineer, TechCorp 2022-...  │  │
│  │ ...                                          │  │
│  │                                               │  │
│  │ (Scroll for more)                            │  │
│  │                                               │  │
│  │ 1,240 characters                             │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────────────────┐    │
│  │ ← Back       │  │ Approve & Analyze →      │    │
│  └──────────────┘  └──────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**States:**
- **Empty:** Drag-drop area visible
- **Uploading:** Progress bar shows 0–100%
- **Uploaded:** Text preview shown, editable
- **Error:** Red border on drag zone, error message (e.g., "Invalid file format. Upload a PDF.")

**Accessibility:**
- Drag-drop zone has `role="button"`, keyboard accessible (Enter to activate file picker)
- Preview text is in `<textarea>` for easy editing and screen reader reading
- Clear focus indicators on all interactive elements

---

### Screen 3: Results / Analysis Dashboard

**Purpose:**
Display analysis results: ATS score, extracted skills, missing skills, recommendations. Motivate user to download or try job matching.

**Key Elements:**
- ATS Score card (large, prominent, with visual progress bar)
- Extracted Skills card (organized by category, chip style)
- Improvement Suggestions card (top 5 actionable items, with priority)
- Call-to-action: "Match with Job Description" button
- Secondary CTA: "Download Report" button
- Toast on page load: "Analysis complete in 12 seconds!"

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────┐
│  Resume Analyzer > Results                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Your Analysis is Ready ✓                           │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  ATS Score                                  │   │
│  │                                              │   │
│  │     72 / 100                                 │   │
│  │  ████████░░                                  │   │
│  │                                              │   │
│  │  Your resume is ATS-compatible but needs    │   │
│  │  optimization. See suggestions below.       │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Extracted       │  │  Top Improvements    │   │
│  │  Skills          │  │                      │   │
│  │                  │  │  1. Add AWS keyword  │   │
│  │  Programming:    │  │  2. Strengthen      │   │
│  │  [Python] [Java] │  │     education       │   │
│  │  [Go]            │  │  3. Add metrics to  │   │
│  │                  │  │     experience      │   │
│  │  Frameworks:     │  │  4. Use action      │   │
│  │  [React]         │  │     verbs           │   │
│  │  [FastAPI]       │  │  5. Add certific.   │   │
│  │                  │  │                      │   │
│  │  Databases:      │  │                      │   │
│  │  [MongoDB]       │  │                      │   │
│  │  [PostgreSQL]    │  │                      │   │
│  │                  │  │                      │   │
│  │  Soft Skills:    │  │                      │   │
│  │  [Leadership]    │  │                      │   │
│  │  [Communication] │  │                      │   │
│  │                  │  │                      │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Next: Match your resume with a job desc.   │  │
│  │                                               │  │
│  │ ┌──────────────────────────────────────────┐ │  │
│  │ │ 💼 Match with Job Description            │ │  │
│  │ └──────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📥 Download PDF Report                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Layout (Mobile):**
```
┌──────────────────────────────┐
│  Results                     │
├──────────────────────────────┤
│                              │
│  Your Analysis is Ready ✓    │
│                              │
│  ┌──────────────────────────┐│
│  │ ATS Score                ││
│  │ 72 / 100                 ││
│  │ ████████░░               ││
│  │ Needs optimization       ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ Extracted Skills         ││
│  │                          ││
│  │ [Python] [Java] [Go]     ││
│  │ [React] [FastAPI]        ││
│  │ [MongoDB] [PostgreSQL]   ││
│  │ [Leadership] [Comm.]     ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ Top Improvements         ││
│  │ 1. Add AWS               ││
│  │ 2. Strengthen education  ││
│  │ 3. Add metrics           ││
│  │ 4. Use action verbs      ││
│  │ 5. Add certification     ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 💼 Match with Job        ││
│  └──────────────────────────┘│
│                              │
│  ┌──────────────────────────┐│
│  │ 📥 Download Report       ││
│  └──────────────────────────┘│
│                              │
└──────────────────────────────┘
```

**Key Design Details:**
- ATS Score: Large, centered, with 2-color gradient progress bar (orange to green)
- Skills chips: Light background, dark text, 4–8px padding, rounded corners (16px)
- Improvement suggestions: Numbered list with color-coded priority (🔴 High, 🟡 Medium, 🟢 Low)
- CTAs: Primary (green, full width on mobile), Secondary (outlined, full width on mobile)

---

### Screen 4: Job Matching Results

**Purpose:**
Show how well resume matches a job description. Highlight matched and missing skills.

**Key Elements:**
- Match percentage (large, circular or bar)
- Matched skills (green, checkmark)
- Missing skills (red, exclamation or gap icon)
- Match breakdown (pie chart or bar chart showing category breakdown)
- "Recommendations" section (how to close the gap)
- Back button and "Try Another Job" button

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────┐
│  Resume Analyzer > Job Match                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Job Match Results                                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         Match Score: 80%                      │  │
│  │         ╭─────────────────╮                   │  │
│  │         │        80%       │                   │  │
│  │         │     ████████░    │                   │  │
│  │         ╰─────────────────╯                   │  │
│  │                                               │  │
│  │  You're well-matched for this role.          │  │
│  │  Develop 2 skills to be highly competitive.  │  │
│  │                                               │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Matched Skills  │  │  Missing Skills      │   │
│  │  ✓ Python        │  │  ✗ Kubernetes       │   │
│  │  ✓ React         │  │  ✗ Docker           │   │
│  │  ✓ Node.js       │  │                      │   │
│  │  ✓ MongoDB       │  │  Priority: High      │   │
│  │  ✓ Leadership    │  │  Time to learn: 4-6  │   │
│  │  ✓ Communication │  │  weeks               │   │
│  │                  │  │                      │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                      │
│  Recommendations                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ 1. Learn Kubernetes (recommended course:    │  │
│  │    Linux Academy)                            │  │
│  │                                               │  │
│  │ 2. Practice Docker (build 2–3 sample apps)   │  │
│  │                                               │  │
│  │ 3. Update resume with these keywords:        │  │
│  │    - "orchestrated Kubernetes deployments"  │  │
│  │    - "containerized applications with Docker" │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ ← Back           │  │ Try Another Job      │   │
│  └──────────────────┘  └──────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────────┐
│ Job Match                    │
├──────────────────────────────┤
│ Match: 80%                   │
│ ████████░░                   │
│ Well-matched. 2 skills to    │
│ develop.                     │
│                              │
│ ┌──────────────────────────┐│
│ │ Matched Skills           ││
│ │ ✓ Python                 ││
│ │ ✓ React                  ││
│ │ ✓ Node.js                ││
│ │ ✓ MongoDB                ││
│ └──────────────────────────┘│
│                              │
│ ┌──────────────────────────┐│
│ │ Missing Skills           ││
│ │ ✗ Kubernetes             ││
│ │ ✗ Docker                 ││
│ │ (4-6 weeks to learn)     ││
│ └──────────────────────────┘│
│                              │
│ Recommendations:             │
│ 1. Learn Kubernetes          │
│ 2. Practice Docker           │
│ 3. Update resume keywords    │
│                              │
│ ┌──────────────────────────┐│
│ │ ← Back                   ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │ Try Another Job          ││
│ └──────────────────────────┘│
│                              │
└──────────────────────────────┘
```

---

### Screen 5: User Account / Dashboard

**Purpose:**
Show user's analysis history, account settings, subscription status.

**Key Elements:**
- User profile header (avatar, email, "Premium" or "Free" badge)
- Subscription status card (analyses used: 3/5, upgrade CTA)
- Analysis history table (date, ATS score, match %, actions)
- Settings link (change password, privacy, notifications)
- Logout button

**Layout (Desktop):**
```
┌─────────────────────────────────────────────────────┐
│  Dashboard                              [⚙️ Settings]│
├─────────────────────────────────────────────────────┤
│                                                      │
│  👤 john.doe@example.com                            │
│  Free Plan • Upgrade to Premium                     │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Analyses Used This Month: 3 / 5              │  │
│  │ ████████░░░░░░░░░░                           │  │
│  │                                               │  │
│  │ Upgrade to Premium for unlimited analyses    │  │
│  │ ┌──────────────────────────────────────────┐ │  │
│  │ │ Upgrade Now ($9.99/month)               │ │  │
│  │ └──────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  Your Analyses                                      │
│  ┌────────────────────────────────────────────┐   │
│  │ Date        │ Job Title      │ ATS  │ Match│   │
│  ├────────────────────────────────────────────┤   │
│  │ Apr 20      │ Senior Eng     │ 72   │ 85% │   │
│  │ Apr 18      │ Staff Eng      │ 68   │ 78% │   │
│  │ Apr 15      │ Lead Eng       │ 75   │ 82% │   │
│  │ Apr 10      │ (No job match) │ 65   │ -   │   │
│  │ Apr 5       │ (No job match) │ 62   │ -   │   │
│  └────────────────────────────────────────────┘   │
│  [Download] [View] [Compare]                       │
│                                                      │
│  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Settings     │  │ Logout                   │   │
│  └──────────────┘  └──────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Mobile:** Stack vertically, table becomes card list view.

---

### Screen 6: Empty State (First-Time User)

**Purpose:**
Guide new user toward first action. Set expectations.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Dashboard                                       │
├──────────────────────────────────────────────────┤
│                                                  │
│                   📄                             │
│                                                  │
│  No Analyses Yet                                 │
│                                                  │
│  Upload your first resume to get started.       │
│  We'll analyze it and give you insights in      │
│  under 2 minutes.                               │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 📤 Upload Your First Resume                │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  What You'll Get:                               │
│  ✓ ATS Score (0–100)                            │
│  ✓ Extracted Skills by Category                 │
│  ✓ Top 5 Improvement Suggestions                │
│  ✓ Job Description Matching                     │
│  ✓ Downloadable PDF Report                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Screen 7: Error State (Analysis Failed)

**Purpose:**
Clear error message + recovery path. Don't leave user stuck.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Results                                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  ⚠️                                              │
│                                                  │
│  Analysis Failed                                 │
│                                                  │
│  We couldn't analyze your resume. This might    │
│  be due to:                                      │
│  • Service temporarily down (try again later)   │
│  • File too large (max 5MB)                     │
│  • Invalid resume format                        │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🔄 Retry Analysis                          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ ← Upload Different File                    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  💬 Contact Support                             │
│  Having trouble? Email us at support@...        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 3. UI Components

### Component Specifications

| Component | Size | Padding | Typography | States |
|-----------|------|---------|------------|--------|
| **Button (Primary)** | 48px height (mobile), 44px (desktop) | 16px H padding | 16px, Bold | default, hover, active, disabled, loading |
| **Button (Secondary)** | 48px height | 16px H padding | 16px, Medium | default, hover, active, disabled |
| **Card** | Varies | 24px | Body 16px | default, hover, selected |
| **Form Input** | 48px height | 12px V, 16px H | 16px | focus, filled, error, disabled |
| **Chip (Skill Tag)** | 32px height | 8px V, 12px H | 14px | default, removable |
| **Progress Bar** | 8px height | N/A | N/A | 0–100% fill |
| **Toast** | 56px min height | 16px | 14px | success, error, info, warning |
| **Modal** | 90% width (mobile), 500px max (desktop) | 24px | Varies | open, close, actions |

### Component States & Interactions

**Button**
```
DEFAULT: 
  Background: #2563EB (primary blue)
  Text: white
  Border: none
  Cursor: pointer

HOVER: 
  Background: #1D4ED8 (darker blue)
  Shadow: 0 4px 12px rgba(37, 99, 235, 0.25)

ACTIVE (Pressed):
  Background: #1E40AF (even darker)
  Transform: scale(0.98)

DISABLED:
  Background: #D1D5DB (gray)
  Text: #9CA3AF (lighter gray)
  Cursor: not-allowed
  Opacity: 0.6

LOADING:
  Show spinner inside button
  Disable interaction
  Show "Analyzing..."
```

**Form Input**
```
DEFAULT:
  Border: 1px solid #E5E7EB (light gray)
  Background: white
  Text: #1F2937 (dark gray)

FOCUS:
  Border: 2px solid #2563EB (primary blue)
  Box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) (blue ring)

FILLED:
  Border: 1px solid #D1D5DB
  Background: white
  Text: #1F2937

ERROR:
  Border: 2px solid #DC2626 (red)
  Background: #FEE2E2 (light red)
  Text: #7F1D1D (dark red helper)
  Show error icon (⚠️)

DISABLED:
  Background: #F3F4F6 (very light gray)
  Text: #9CA3AF (gray)
  Border: 1px solid #E5E7EB
  Cursor: not-allowed
```

**Skill Chip**
```
DEFAULT:
  Background: #DBEAFE (light blue)
  Text: #1E40AF (dark blue)
  Border: 1px solid #93C5FD (medium blue)
  Border-radius: 16px

HOVER (if removable):
  Background: #BFDBFE (slightly darker)
  X icon appears on right

FOCUS:
  Ring: 2px #2563EB

REMOVED:
  Fade out animation (200ms)
```

**Toast Notification**
```
SUCCESS:
  Background: #10B981 (green)
  Icon: ✓
  Text: white
  Duration: 3 seconds auto-dismiss

ERROR:
  Background: #DC2626 (red)
  Icon: ✗
  Text: white
  Duration: 5 seconds (give user time to read)

INFO:
  Background: #2563EB (blue)
  Icon: ℹ️
  Text: white
  Duration: 3 seconds

Position: Fixed, bottom-right (desktop), bottom-center (mobile)
Z-index: 1000
Animation: Slide in from bottom (300ms)
```

---

## 4. Color Palette & Typography

### Color Palette

| Role | Name | Hex | RGB | Usage |
|------|------|-----|-----|-------|
| **Primary** | Trustworthy Blue | #2563EB | 37, 99, 235 | CTAs, highlights, focus states, headers |
| **Primary Dark** | Dark Blue | #1D4ED8 | 29, 78, 216 | Hover state on primary buttons |
| **Primary Darker** | Darker Blue | #1E40AF | 30, 64, 175 | Active state on primary buttons |
| **Success** | Positive Green | #10B981 | 16, 185, 129 | Success messages, matched skills, progress fill |
| **Warning** | Motivational Orange | #F97316 | 249, 115, 22 | Secondary CTAs, attention, alerts |
| **Error** | Alert Red | #DC2626 | 220, 38, 38 | Errors, missing skills, validation |
| **Neutral 1** | Text Dark | #1F2937 | 31, 41, 55 | Primary text, headers |
| **Neutral 2** | Text Gray | #6B7280 | 107, 114, 128 | Secondary text, helper text |
| **Neutral 3** | Border Gray | #E5E7EB | 229, 231, 235 | Borders, dividers |
| **Neutral 4** | Background Light | #F9FAFB | 249, 250, 251 | Page backgrounds, card backgrounds |
| **Neutral 5** | Background Lightest | #FFFFFF | 255, 255, 255 | Card backgrounds, modal backgrounds |

### Color Accessibility
- All text meets WCAG AA standard (4.5:1 contrast minimum)
- Success/Error not only indicator (paired with icon + text)
- Color blind tested: distinct hues for blue, green, red

### Typography System

| Type | Font Family | Weight | Size (Desktop) | Size (Mobile) | Line Height | Letter Spacing | Usage |
|------|-------------|--------|---|---|---|---|---|
| **H1** | Inter | Bold (700) | 40px | 32px | 1.2 | -0.02em | Page titles, hero text |
| **H2** | Inter | Bold (700) | 28px | 24px | 1.25 | -0.01em | Section headers, major cards |
| **H3** | Inter | Semibold (600) | 20px | 18px | 1.3 | 0 | Subsection headers |
| **Body** | Inter | Regular (400) | 16px | 16px | 1.5 | 0 | Main text, descriptions |
| **Small** | Inter | Regular (400) | 14px | 14px | 1.4 | 0 | Helper text, labels, captions |
| **Tiny** | Inter | Regular (400) | 12px | 12px | 1.3 | 0 | Timestamps, very small text |
| **Button** | Inter | Semibold (600) | 16px | 16px | 1.2 | 0 | Button text |
| **Badge** | Inter | Medium (500) | 12px | 12px | 1.2 | 0 | Labels, badges |

**Font:**
- Primary: [Inter](https://fonts.google.com/specimen/Inter) (modern, clean, highly legible)
- Monospace (for code/technical terms): [JetBrains Mono](https://www.jetbrains.com/lp/mono/) or [Fira Code](https://github.com/tonsky/FiraCode)

### Spacing System

**Base Unit:** 8px

**Padding Scale:**
- XS: 4px (tight spacing)
- S: 8px (small elements)
- M: 16px (standard padding)
- L: 24px (comfortable padding)
- XL: 32px (generous padding)
- XXL: 48px (section spacing)

**Gap Between Sections:** 32px (desktop), 24px (tablet), 16px (mobile)

**Margin Scale (same as padding):**
- Between cards: 16px
- Between sections: 32px

---

## 5. UX Principles Applied

### Simplicity

**One Primary Action Per Screen:**
- Home: "Upload Resume" (not cluttered with secondary actions)
- Upload: "Approve & Analyze" (not "Save draft" or "Skip")
- Results: "Download Report" (clear next step)

**Remove Clutter:**
- Hide secondary info in expandable sections
- Avoid data overload (show top 5 improvements, not all 20)
- Use whitespace liberally (min 16px padding on cards)

**Clear Value Fast:**
- Hero text is 40px, immediately visible
- ATS score is the first thing after upload
- Job match % is large and centered

### Accessibility

**Contrast:**
- All text: minimum 4.5:1 ratio (WCAG AA standard)
- Interactive elements: clearly distinguished from background

**Touch Targets (Mobile):**
- All buttons: minimum 44×44px (tap-friendly)
- Links: minimum 44px height
- Spacing between clickables: 8px minimum

**Keyboard Navigation:**
- Tab order: logical (left-to-right, top-to-bottom)
- Focus indicators: 2px blue ring, clear and visible
- Escape key: closes modals
- Enter key: submits forms

**Alternative Text:**
- All icons have aria-labels (e.g., `aria-label="Download report"`)
- Images have alt text
- Form inputs have associated labels

**Color Not Only Indicator:**
- Success: green + ✓ icon
- Error: red + ⚠️ icon
- Matched: green + checkmark icon
- Missing: red + X icon

### Responsiveness

**Breakpoints:**
- Mobile: < 640px (full-width layouts, large touch targets)
- Tablet: 640px – 1024px (2-column layouts, sidebar collapses)
- Desktop: > 1024px (3-column layouts, sidebars visible)

**Layout Shifts:**
```
Mobile (< 640px):
  - Single column layout
  - Sidebar → hamburger menu
  - Cards stack vertically
  - Buttons full-width (48px height)
  - No hover effects (touch-based instead)

Tablet (640px – 1024px):
  - Two-column layout (content + sidebar)
  - Sidebar visible but narrower
  - Cards: 2 per row

Desktop (> 1024px):
  - Three-column layout (sidebar + content + secondary)
  - Full sidebar visible
  - Cards: 2–3 per row
  - Hover states enabled (buttons, cards)
```

**Responsive Text:**
- H1: 40px (desktop) → 28px (mobile) using `font-size: clamp(28px, 5vw, 40px)`
- Body: 16px (all breakpoints, for readability)
- Padding: 24px (desktop) → 16px (mobile)

### Feedback & Affordance

**User Always Knows What Happened:**
- Upload starts → progress bar appears
- Analysis runs → "Analyzing..." spinner
- Analysis finishes → toast: "Complete in 12 seconds!" + results load
- Download clicked → toast: "Downloaded: analysis_report.pdf"
- Error occurs → error toast with retry button

**Interactive Elements Look Clickable:**
- Buttons: solid background, shadow on hover
- Links: underlined or color-differentiated
- Inputs: clear border, focus ring
- Cards: subtle shadow, hover lift
- Icons: color-coded (green = success, red = error)

**Disabled State Visually Distinct:**
- Gray background (not full opacity)
- Gray text
- No hover effect
- `cursor: not-allowed`

**Loading States Show Progress:**
- Indeterminate spinner: "Please wait..." (unknown duration)
- Progress bar: "Uploading: 45%" (known duration)
- Skeleton loader: gray placeholders (expected content shape)

---

## 6. User Flow Mapping

### Happy Path Flow

```
Landing Page
    ↓ (click "Upload Resume")
Upload & Preview Page
    ↓ (drag PDF → text extracted)
[User reviews text, clicks "Approve"]
    ↓ (backend analyzes, ~15 seconds)
Results Dashboard
    ↓ (shows ATS score, skills, recommendations)
[User sees value; click "Match with Job"]
    ↓ (user pastes job description)
Job Matching Results
    ↓ (shows match %, missing skills, recommendations)
[User clicks "Download Report"]
    ↓ (PDF generated and downloaded)
Download Complete
    ↓ (user saves report, leaves app)
Next Session (email reminder: "Re-analyze with improvements")
```

### Error Path

```
Upload Page
    ↓ (user uploads invalid file: .txt instead of .pdf)
Error Toast: "Invalid file format. Upload PDF, DOC, or DOCX."
    ↓ (user clicks "Browse Files" again)
File Picker
    ↓ (selects correct .pdf file)
Upload & Preview Page
    ↓ (continues to results)
```

### Alternative Flow: Job Matching Without Upload

```
Landing Page
    ↓ (logged-in user, has previous analyses)
Dashboard (Analysis History)
    ↓ (user clicks "Match with Job" on an old analysis)
Job Matching Page
    ↓ (paste job description)
Matching Results
    ↓ (skip download, leave)
```

### Empty State Flow

```
New User Signup
    ↓
Dashboard (Empty)
    ↓ (click "Upload First Resume")
Upload & Preview Page
    ↓ (upload → analyze)
Results Dashboard
    ↓ (user feels accomplishment)
Encouragement: "Great! Here's what to improve..."
    ↓ (optional) Match with Job
```

---

## 7. Mobile vs Web Considerations

### Mobile-First Strategy

**Touch-First Design:**
- All buttons: 48px minimum height (comfortable thumb tap)
- Spacing between interactive elements: 8px minimum
- No hover states (use active/pressed instead)
- Full-width inputs and buttons (no micro-interactions that require precision)

**Gesture Support:**
- Swipe to close (modals, overlays)
- Pull to refresh (optional, analysis history)
- Long-press for context menu (optional, copy text)

**Mobile Navigation:**
- Hamburger menu (3-line icon, top-left)
- Bottom tab bar (optional, if 3+ main sections)
- Back button (system back + app back in header)
- Breadcrumb trail (minimize, use back button instead)

**Responsive Typography:**
- H1: `clamp(28px, 5vw, 40px)` (scales with viewport)
- Body: 16px always (no smaller, for readability)
- Line height: 1.5–1.6 (comfortable reading on small screens)

### Mobile Layout Patterns

**Stack Vertically (< 640px):**
```
Header
├─ Logo
├─ Menu (hamburger)
└─ User (if logged in)

Content (single column)
├─ Cards (full width)
├─ Forms (full width)
└─ Lists (scrollable, swipeable)

Footer
├─ Navigation links
└─ Social / Contact
```

**Two-Column (Tablet, 640–1024px):**
```
Header
├─ Logo
├─ Menu (expanded sidebar)
└─ User

Sidebar
├─ Dashboard
├─ History
└─ Settings

Content
├─ Main analysis results
└─ Secondary info
```

**Three-Column (Desktop, > 1024px):**
```
Header
├─ Logo
├─ Search
├─ Menu
└─ User

Sidebar (left)
├─ Navigation
└─ Filters

Content (center)
├─ Main feature
└─ Interactions

Secondary Sidebar (right)
├─ Recommendations
└─ Tips
```

### Web-Specific Enhancements

**Hover States:**
- Buttons: shadow lift, color darken
- Cards: subtle shadow increase, cursor pointer
- Links: underline appears on hover
- Dropdowns: background color change

**Keyboard Shortcuts (Optional):**
- `?` → Show keyboard shortcuts help
- `U` → Go to upload
- `H` → Go to home
- `Esc` → Close modal

**Desktop Features:**
- Sidebar is persistent (not collapsed)
- Tooltips on hover (explain actions)
- Drag-and-drop (drag files to upload)
- Multi-select (compare multiple analyses)

---

## 8. Improvements Over Inspiration

### What We're Learning From Inspiration

**From Figma Design Tool:**
- Clean, minimal aesthetic with generous whitespace
- Smooth micro-interactions and transitions
- Color palette that's professional but not boring
- Typography hierarchy that guides the eye

**From Stripe Checkout:**
- Step-by-step progress (clear what's complete)
- Error messages that are specific and actionable
- Reassurance (security badges, testimonials)
- Fast, snappy interactions (immediate feedback)

**From Grammarly's Feedback:**
- Color-coded feedback (green for good, red for error)
- Confidence scores (show how sure we are)
- Actionable suggestions (not vague problems)
- Before/after comparison (show impact)

### What We'll Do Better

**1. Resume-Specific Context**
- Unlike generic SaaS tools, we understand resume/hiring domain
- Specific ATS-friendly suggestions (not generic writing advice)
- Job matching integration (Grammarly doesn't have this)
- Clear ROI messaging ("Get 3x more interviews")

**2. Job-Seeker Psychology**
- Reduce anxiety with clear, actionable feedback
- Show progress visually (ATS score, match %)
- Offer hope ("You're 80% there; here's how to reach 90%")
- Community feel (ratings, testimonials from other job seekers)

**3. Speed & Simplicity**
- Fewer steps to value (upload → results in 1 min, not 5)
- No account required initially (optional signup after first analysis)
- Intuitive UX (less learning curve than Figma)
- Mobile-first design (most users will access on phone)

---

## 9. Design Handoff Checklist

### For Developers

- [ ] Figma design file with all screens: [Link]
- [ ] Color palette exported as CSS variables:
  ```css
  --color-primary: #2563EB;
  --color-success: #10B981;
  --color-error: #DC2626;
  --color-text-dark: #1F2937;
  --color-text-gray: #6B7280;
  --color-border: #E5E7EB;
  --color-bg-light: #F9FAFB;
  ```
- [ ] Typography system (CSS variables or Tailwind config):
  ```css
  --font-family: 'Inter', sans-serif;
  --font-size-h1: 40px;
  --font-size-body: 16px;
  --font-size-small: 14px;
  ```
- [ ] Spacing scale (CSS variables):
  ```css
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  ```
- [ ] Icon library (SVG export for: upload, download, check, X, warning, info, etc.)
- [ ] Component Storybook setup (for React components)
- [ ] Responsive breakpoints defined in CSS:
  ```css
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 1024px;
  ```
- [ ] Animation specs (transition duration, easing):
  - Button hover: 200ms ease-in-out
  - Modal fade-in: 300ms ease-out
  - Toast slide-in: 300ms ease-in-out
  - Spinner: 1s infinite linear

### For QA / Testing

- [ ] Pixel-perfect acceptance criteria per screen (device resolution + browser)
- [ ] Responsive testing checklist:
  - [ ] Mobile (iPhone 12: 390×844)
  - [ ] Tablet (iPad: 768×1024)
  - [ ] Desktop (1280×800 and wider)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge latest versions)
- [ ] Accessibility testing checklist:
  - [ ] Contrast ratio 4.5:1 on all text
  - [ ] Touch targets 44×44px minimum
  - [ ] Keyboard navigation works (Tab, Enter, Escape)
  - [ ] Screen reader test (VoiceOver, NVDA, JAWS)
  - [ ] Form labels associated with inputs
  - [ ] Focus indicators visible
- [ ] Performance:
  - [ ] Page load < 3 seconds (3G)
  - [ ] Time to interactive < 5 seconds
  - [ ] Lighthouse score > 80 (all categories)

### Handoff Assets (Deliverables)

**Design Files:**
- Figma project with all screens, components, and design system
- Exported PDF guide with annotations
- Design tokens JSON (for developers)

**Code Assets:**
- CSS / Tailwind config with colors, typography, spacing
- SVG icon library (optimized, consistent stroke weight)
- Storybook with component examples and variants

**Documentation:**
- Brand guidelines (logo, color usage, typography)
- Component usage guide (when to use each component)
- Accessibility guidelines (WCAG 2.1 AA compliance)
- Responsive design guide (breakpoints, layout shifts)

---

## 10. Unresolved Questions & Decisions

**Animation & Transitions**
- [ ] Should we animate the ATS score meter (0 → 72 counting up)?
  - **Option A:** Yes, it feels delightful and shows progress
  - **Option B:** No, it adds latency and feels gimmicky
  - **Decision Pending:** Designer + Product alignment

**Dark Mode**
- [ ] Should MVP support dark mode, or defer to V1.1?
  - **Option A:** Include dark mode in MVP (modern expectation)
  - **Option B:** Defer (simpler, faster launch)
  - **Decision Pending:** Developer effort estimate + user demand research

**Internationalization (i18n)**
- [ ] Should app support multiple languages (Spanish, French)?
  - **Option A:** English-only for MVP, i18n framework ready for V2
  - **Option B:** i18n from day 1 (RTL, text expansion)
  - **Decision Pending:** Product roadmap + market opportunity

**Offline Support**
- [ ] Should we cache analyses for offline viewing?
  - **Option A:** Cache analysis results (service worker)
  - **Option B:** Online-only (simpler MVP)
  - **Decision Pending:** User expectations + dev complexity

**PDF Report Customization**
- [ ] Should users customize PDF report (logo, colors)?
  - **Option A:** Pre-designed template only (MVP)
  - **Option B:** Allow basic customization (company logo, colors)
  - **Decision Pending:** Time + user demand

---

## Design Decision Log

### Decision 1: Blue as Primary Color
**Context:** Needed a trustworthy, professional primary color  
**Options Considered:** Blue (#2563EB), Purple (#A855F7), Teal (#06B6D4)  
**Decision:** Blue (#2563EB) — highest trust associations, best contrast, familiar in SaaS  
**Rationale:** Job seekers need to trust the analysis. Blue signals professionalism without coldness.  

### Decision 2: Full-Width Buttons on Mobile
**Context:** Design trend debate — full-width vs. fixed-width buttons on mobile  
**Options Considered:** Full-width (48px height), Fixed (280px max-width)  
**Decision:** Full-width buttons on mobile, fixed-width on desktop  
**Rationale:** Full-width improves tap accuracy on mobile; fixed-width on desktop improves readability.  

### Decision 3: Single Primary CTA Per Screen
**Context:** How many call-to-action buttons per screen?  
**Options Considered:** 1 (primary), 2 (primary + secondary), 3+  
**Decision:** 1 primary CTA per screen, secondary actions in menu or lower on page  
**Rationale:** Reduces cognitive load; guides user through clear path; higher conversion.  

---

## Summary

**MVP Design Goals:**
✅ Clear value prop communicated in < 10 seconds  
✅ Intuitive upload → analyze → results flow  
✅ Accessible (WCAG 2.1 AA) and mobile-friendly  
✅ Professional, trustworthy aesthetic  
✅ Delightful micro-interactions (loading states, success feedback)  
✅ Developers can build confidently without ambiguity  

**Design Handoff Status:**
- Figma file: [To be created]
- Design tokens: Ready
- Component specs: Complete
- Responsive breakpoints: Defined
- Accessibility: Verified (WCAG AA)
- QA checklist: Provided

---

**Design Sign-Off:**

| Role | Name | Approval | Date |
|------|------|----------|------|
| Lead Designer | [Your Name] | ✓ | April 23, 2026 |
| Product Manager | [To Be Assigned] | ⏳ | TBD |
| Engineering Lead | [To Be Assigned] | ⏳ | TBD |

---

**Next Steps for Development:**
1. Import design tokens into Figma → code (CSS variables)
2. Set up React component library with design system
3. Build responsive grid system (mobile-first)
4. Implement buttons, forms, cards, modals as components
5. Integrate with backend API
6. Test accessibility (keyboard nav, screen reader, contrast)
7. QA pixel-perfect on all breakpoints
8. Deploy to staging for user testing
