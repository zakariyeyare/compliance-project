# 4+1 Architectural Views - Compliance Management System

Based on Kruchten's 4+1 Model for Software Architecture

---

## Overview: The 4+1 Model

```
                    ┌─────────────────┐
                    │  Logical View   │
                    │  (Functionality)│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
│  Process View   │  │  Scenarios  │  │ Development View│
│  (Performance)  │  │  (Use Cases)│  │  (Organization) │
└─────────────────┘  └─────────────┘  └─────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Physical/Deploy │
                    │      View       │
                    └─────────────────┘
```

---

## 1. Logical View
**"What are the functions of the system and the requirements?"**

### Purpose
Describes the system's functional elements and their relationships from an end-user perspective.

### Artifacts in Our System

#### Class Diagrams (Component Structure)
```
┌────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Login     │  │GDPRDashboard │  │   Reports    │    │
│  │              │  │              │  │              │    │
│  │ - email      │  │ - policies   │  │ - reportList │    │
│  │ - password   │  │ - controls   │  │ - filters    │    │
│  │              │  │              │  │              │    │
│  │+ handleLogin │  │+ savePolicy  │  │+ createReport│    │
│  │+ validate    │  │+ loadData    │  │+ exportPDF   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │            │
└─────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────┐         ┌────────────────────┐    │
│  │   AuthProvider     │         │     useAuth        │    │
│  │                    │◄────────│                    │    │
│  │ - user             │         │ + getContext()     │    │
│  │ - loading          │         │ + validateUsage()  │    │
│  │                    │         └────────────────────┘    │
│  │ + signIn()         │                                   │
│  │ + signOut()        │         ┌────────────────────┐    │
│  │ + signUp()         │         │ProtectedRoute      │    │
│  │ + resetPassword()  │────────►│                    │    │
│  └────────┬───────────┘         │ + checkAuth()      │    │
│           │                     │ + redirect()       │    │
│           │                     └────────────────────┘    │
└───────────┼────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────┐             │
│  │      gdprSupabaseService                 │             │
│  │                                          │             │
│  │ + getGDPRFullStructure()                 │             │
│  │ + upsertWorkingPolicy(org, sub, content) │             │
│  │ + getWorkingPolicies(orgId)              │             │
│  │ + getPolicyDocuments(orgId)              │             │
│  │ + getUserOrganizations()                 │             │
│  │ + getComplianceStats(orgId)              │             │
│  └──────────────────┬───────────────────────┘             │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│                       DATA LAYER                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────┐         ┌────────────────────┐    │
│  │  SupabaseClient    │         │   LocalStorage     │    │
│  │   (Singleton)      │         │                    │    │
│  │                    │         │ + setItem()        │    │
│  │ + from()           │         │ + getItem()        │    │
│  │ + auth             │         │ + removeItem()     │    │
│  │ + select()         │         └────────────────────┘    │
│  │ + insert()         │                                   │
│  │ + upsert()         │                                   │
│  └────────────────────┘                                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Key Design Patterns (Logical Organization)
1. **Provider Pattern** - AuthProvider wraps entire app
2. **Facade Pattern** - gdprSupabaseService hides complexity
3. **Singleton Pattern** - One SupabaseClient instance
4. **Observer Pattern** - Auth state change subscriptions
5. **HOC Pattern** - ProtectedRoute wraps components

### Stakeholders
- End Users (Compliance Officers)
- Business Analysts
- System Architects

---

## 2. Process View (Dynamic/Process View)
**"How are goals met? How does the system behave at runtime?"**

### Purpose
Shows runtime behavior, concurrency, performance, and scalability aspects.

### Artifacts in Our System

#### Business Process Models (BPMN)

**Location:** `src/models/BPMN/xml/`

##### Process 1: Authentication Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION SEQUENCE                    │
└─────────────────────────────────────────────────────────────┘

USER                WEBAPP              SUPABASE
  │                   │                    │
  │  Open App         │                    │
  ├──────────────────►│                    │
  │                   │                    │
  │  Enter Credentials│                    │
  ├──────────────────►│                    │
  │                   │                    │
  │                   │  Auth Request      │
  │                   ├───────────────────►│
  │                   │                    │
  │                   │                    │ Validate
  │                   │                    │ Credentials
  │                   │                    │
  │                   │  Auth Result       │
  │                   │◄───────────────────┤
  │                   │                    │
  │                   │ Update AuthContext │
  │                   │ (Observer Pattern) │
  │                   │                    │
  │  Redirect to GDPR │                    │
  │◄──────────────────┤                    │
  │   Dashboard       │                    │
  │                   │                    │
```

**Concurrency:** Multiple users can authenticate simultaneously (stateless auth tokens)

**File:** `authentication-flow.bpmn`

##### Process 2: Policy Creation & Management
```
┌─────────────────────────────────────────────────────────────┐
│              POLICY CREATION WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘

USER                WEBAPP              STORAGE
  │                   │                    │
  │  Load GDPR        │                    │
  │  Dashboard        │                    │
  ├──────────────────►│                    │
  │                   │  Fetch Structure   │
  │                   ├───────────────────►│
  │                   │                    │ Query DB
  │                   │  Return Hierarchy  │
  │                   │◄───────────────────┤
  │                   │                    │
  │  Display Controls │                    │
  │◄──────────────────┤                    │
  │                   │                    │
  │  Edit Policy Text │                    │
  ├──────────────────►│                    │
  │                   │                    │
  │                   │ Save Draft         │
  │  Click Save       │ (LocalStorage)     │
  ├──────────────────►├───────────────────►│
  │                   │                    │
  │                   │ Optional: Sync     │
  │                   │ to Supabase        │
  │                   ├───────────────────►│
  │                   │                    │
  │  Show Success     │                    │
  │◄──────────────────┤                    │
  │                   │                    │
```

**Performance:** 
- LocalStorage provides instant save (< 10ms)
- Background sync to Supabase (non-blocking)

**File:** `policy-creation-flow.bpmn`

##### Process 3: Report Lifecycle
```
┌─────────────────────────────────────────────────────────────┐
│                  REPORT WORKFLOW                            │
└─────────────────────────────────────────────────────────────┘

COMPLIANCE OFFICER    WEBAPP         APPROVER
  │                     │               │
  │ Create Report       │               │
  ├────────────────────►│               │
  │                     │               │
  │                     │ Generate v1.0 │
  │                     │ Status: Draft │
  │                     │               │
  │ Submit for Approval │               │
  ├────────────────────►│               │
  │                     │               │
  │                     │ Notify        │
  │                     ├──────────────►│
  │                     │               │
  │                     │               │ Review
  │                     │               │
  │                     │ Decision      │
  │                     │◄──────────────┤
  │                     │               │
  │                  ┌──┴──┐            │
  │                  │ XOR │            │
  │                  └──┬──┘            │
  │                     │               │
  │        Approved     │    Rejected   │
  │     ┌───────────────┼───────────┐   │
  │     ▼               │           ▼   │
  │  Publish         Return      Edit   │
  │  v1.0            to Draft    Again  │
  │                     │               │
```

**States:** Draft → Pending Approval → Approved/Rejected → Published

**File:** `report-workflow.bpmn`

#### Sequence Diagrams

**Complete System Interaction:**
`complete-system-architecture.bpmn` - Shows all 3 layers (USER, WEBAPP, SUPABASE) collaborating

### Stakeholders
- System Engineers
- Performance Engineers
- Integration Specialists

---

## 3. Development View
**"How is the system organized for development?"**

### Purpose
Shows the system's organization from a programmer's perspective - modules, packages, libraries, and dependencies.

### Artifacts in Our System

#### Component Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     PROJECT STRUCTURE                       │
└─────────────────────────────────────────────────────────────┘

compliance/
│
├── src/                          ◄── Main Source Code
│   │
│   ├── main.jsx                  ◄── Entry Point
│   ├── WebApp.jsx                ◄── Root Component + Routing
│   │
│   ├── screen/                   ◄── PRESENTATION LAYER
│   │   ├── Login.jsx             │   (User-facing screens)
│   │   ├── Register.jsx          │
│   │   ├── Dashboard.jsx         │
│   │   ├── GDPRDashboard.jsx     │
│   │   ├── ComplianceOverview.jsx│
│   │   ├── Reports.jsx           │
│   │   └── Udskriv.jsx           │
│   │
│   ├── components/               ◄── APPLICATION LAYER
│   │   ├── AuthContext.jsx       │   (Business logic)
│   │   ├── AuthContextBase.js    │
│   │   ├── ProtectedRoute.jsx    │
│   │   ├── gdbrSupabase.js       │   (Service facade)
│   │   └── ui/                   │
│   │       ├── Layout.jsx        │   (Reusable UI)
│   │       └── CustomCard.jsx    │
│   │
│   ├── hooks/                    ◄── CUSTOM HOOKS
│   │   └── useAuth.js            │   (Logic abstraction)
│   │
│   ├── services/                 ◄── SERVICE LAYER
│   │   └── (future services)     │   (External APIs)
│   │
│   ├── SupabaseClient.js         ◄── DATA ACCESS LAYER
│   │                             │   (Singleton client)
│   │
│   ├── models/                   ◄── DOMAIN MODELS
│   │   └── BPMN/                 │   (Process definitions)
│   │       ├── compliance-processes.json
│   │       └── xml/              │
│   │           ├── authentication-flow.bpmn
│   │           ├── policy-creation-flow.bpmn
│   │           ├── report-workflow.bpmn
│   │           └── complete-system-architecture.bpmn
│   │
│   ├── styles/                   ◄── STYLING
│   │   ├── App.css
│   │   ├── Gdpr.css
│   │   └── theme.css
│   │
│   └── types/                    ◄── TYPE DEFINITIONS
│       └── (future TypeScript defs)
│
├── public/                       ◄── Static Assets
│
├── scripts/                      ◄── Build Scripts
│   └── generate-bpmn.js
│
├── package.json                  ◄── Dependencies
├── vite.config.js                ◄── Build Config
├── eslint.config.js              ◄── Code Quality
│
└── Documentation/                ◄── ARCHITECTURE DOCS
    ├── ARCHITECTURE.md
    ├── SYSTEM-DESCRIPTION.md
    ├── BPMN-SYSTEM-ANALYSIS.md
    ├── CRC-CARDS.md
    ├── SOLID-PRINCIPLES.md
    └── 4+1-ARCHITECTURAL-VIEWS.md (this file)
```

#### Module Dependencies
```
┌─────────────────────────────────────────────────────────────┐
│                   DEPENDENCY GRAPH                          │
└─────────────────────────────────────────────────────────────┘

main.jsx
  │
  └──► WebApp.jsx
         │
         ├──► AuthProvider (wraps entire app)
         │      │
         │      └──► SupabaseClient
         │
         └──► Routes
                │
                ├──► Login ──────► useAuth ──► AuthProvider
                │
                ├──► ProtectedRoute ──► useAuth
                │      │
                │      └──► Dashboard ──────────┐
                │      └──► GDPRDashboard ──────┤
                │      └──► Reports ─────────────┼──► gdbrSupabase
                │      └──► ComplianceOverview ─┤        │
                │      └──► Udskriv ────────────┘        │
                │                                        │
                │                                        ▼
                └──────────────────────────────► SupabaseClient
                                                        │
                                                        ▼
                                                  Supabase BaaS
```

#### Package Dependencies
```json
{
  "dependencies": {
    "react": "^18.x",              // UI framework
    "react-dom": "^18.x",          // DOM rendering
    "react-router-dom": "^6.x",   // Client-side routing
    "react-bootstrap": "^2.x",    // UI components
    "bootstrap": "^5.x",          // CSS framework
    "@supabase/supabase-js": "^2.x" // Backend client
  },
  "devDependencies": {
    "vite": "^5.x",               // Build tool
    "eslint": "^8.x"              // Code linting
  }
}
```

### Configuration Files
- `vite.config.js` - Build and dev server config
- `eslint.config.js` - Code quality rules
- `package.json` - Project metadata and dependencies

### Stakeholders
- Developers
- Software Configuration Managers
- Build Engineers

---

## 4. Physical View (Deployment View)
**"How do we ship it? Where does it run?"**

### Purpose
Shows the mapping of software to hardware and network topology.

### Artifacts in Our System

#### Deployment Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│              CLIENT ENVIRONMENT (Browser)              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │         React SPA (Single Page App)          │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │  • HTML/CSS/JavaScript Bundle                │     │
│  │  • React Components (rendered)               │     │
│  │  • Client-side Routing (react-router)        │     │
│  │  • State Management (React Context)          │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │           Browser LocalStorage               │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │  • gdpr_saved_policies (JSON)                │     │
│  │  • gdpr_reports (JSON array)                 │     │
│  │  • gdpr_last_receipt (JSON)                  │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────┬───────────────────────────────────────────┘
             │
             │ HTTPS (443)
             │ REST API + WebSocket
             │
┌────────────▼───────────────────────────────────────────┐
│              SUPABASE CLOUD (BaaS)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │         Supabase API Gateway                 │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │  • REST API Endpoints                        │     │
│  │  • Authentication Service                    │     │
│  │  • Real-time Subscriptions (WebSocket)       │     │
│  │  • Row-level Security (RLS)                  │     │
│  │                                              │     │
│  └──────────────┬───────────────────────────────┘     │
│                 │                                      │
│                 ▼                                      │
│  ┌──────────────────────────────────────────────┐     │
│  │         PostgreSQL Database                  │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │  Tables:                                     │     │
│  │  • standards                                 │     │
│  │  • controls                                  │     │
│  │  • subcontrols                               │     │
│  │  • activities                                │     │
│  │  • organizations                             │     │
│  │  • org_members                               │     │
│  │  • working_policies                          │     │
│  │  • policy_documents                          │     │
│  │  • profiles                                  │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │          Supabase Auth                       │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │  • JWT Token Management                      │     │
│  │  • Session Storage                           │     │
│  │  • Email Verification                        │     │
│  │  • Password Reset                            │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Network Topology
```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK DIAGRAM                          │
└─────────────────────────────────────────────────────────────┘

Internet
    │
    │ HTTPS
    │
    ▼
┌─────────────────┐
│   CDN/Hosting   │  ◄── Static Files (HTML, JS, CSS)
│   (Vite Build)  │      Served from: Vercel/Netlify/etc.
└────────┬────────┘
         │
         │ User requests app
         │
         ▼
┌─────────────────┐
│  User Browser   │
│  (Client)       │
└────────┬────────┘
         │
         │ API Calls (HTTPS)
         │ - Auth requests
         │ - Data queries
         │ - Real-time subscriptions
         │
         ▼
┌──────────────────────────────────┐
│   Supabase Cloud Infrastructure  │
│   Region: EU / US (configurable) │
│                                  │
│   • Load Balancer                │
│   • API Servers (Auto-scale)     │
│   • PostgreSQL (Managed)         │
│   • Auth Service                 │
│   • Real-time Server             │
└──────────────────────────────────┘
```

#### Scalability & Performance

**Client-side:**
- Static files cached by CDN
- LocalStorage reduces server calls
- Lazy loading potential for large components

**Server-side (Supabase):**
- Auto-scaling API servers
- Connection pooling for PostgreSQL
- Read replicas for high-traffic queries
- Global CDN for low latency

### Deployment Steps
1. **Build:** `npm run build` → Generates optimized bundle
2. **Deploy Frontend:** Upload `dist/` to hosting (Vercel, Netlify, etc.)
3. **Backend:** Already deployed (Supabase managed service)
4. **Environment Variables:** 
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Stakeholders
- System Engineers
- DevOps Engineers
- System Administrators

---

## 5. Scenarios (Use Cases) - The "+1"
**"Evidence the links - how do all views work together?"**

### Purpose
Ties all views together through concrete use cases, validating architectural decisions.

### Use Case 1: User Authentication

**Scenario:** New user registers and logs in

**Views Integration:**

| View | Artifact | Role in Scenario |
|------|----------|------------------|
| **Logical** | AuthProvider, Login component | Provides login UI and auth logic |
| **Process** | authentication-flow.bpmn | Shows step-by-step auth sequence |
| **Development** | src/screen/Login.jsx, src/components/AuthContext.jsx | Where developers implement |
| **Physical** | Browser → Supabase Auth → PostgreSQL | Where it executes |

**Flow:**
1. User opens app (Physical: Browser loads React bundle)
2. User enters credentials (Logical: Login component)
3. Click submit (Process: authentication-flow.bpmn step 3)
4. AuthProvider calls Supabase (Development: AuthContext.jsx line 40)
5. Supabase validates (Physical: Auth service → PostgreSQL)
6. Token returned (Process: authentication-flow.bpmn step 6)
7. User redirected to dashboard (Logical: ProtectedRoute)

---

### Use Case 2: Create Compliance Policy

**Scenario:** Compliance officer creates new GDPR policy

**Views Integration:**

| View | Artifact | Role in Scenario |
|------|----------|------------------|
| **Logical** | GDPRDashboard, gdprSupabaseService | UI and service layer |
| **Process** | policy-creation-flow.bpmn | Workflow steps |
| **Development** | src/screen/GDPRDashboard.jsx, src/components/gdbrSupabase.js | Implementation files |
| **Physical** | Browser LocalStorage + Supabase DB | Dual storage strategy |

**Flow:**
1. Officer loads GDPR Dashboard (Physical: API call to Supabase)
2. System fetches structure (Logical: gdprSupabaseService.getGDPRFullStructure())
3. Display controls (Process: policy-creation-flow.bpmn step 2)
4. Officer edits policy text (Development: GDPRDashboard.jsx textarea)
5. Click save (Logical: savePolicyContent function)
6. Save to LocalStorage (Physical: Browser storage, instant)
7. Optional sync to Supabase (Process: background async call)
8. Show success (Logical: UI state update)

---

### Use Case 3: Generate Compliance Report

**Scenario:** Export completed policies as PDF

**Views Integration:**

| View | Artifact | Role in Scenario |
|------|----------|------------------|
| **Logical** | ComplianceOverview, Udskriv | Report generation and print view |
| **Process** | report-workflow.bpmn | Report lifecycle states |
| **Development** | src/screen/ComplianceOverview.jsx, src/screen/Udskriv.jsx | Implementation |
| **Physical** | LocalStorage → Browser Print API | Data source and output |

**Flow:**
1. Officer clicks "Create Report" (Logical: ComplianceOverview)
2. System compiles policies (Development: loadPolicies() in Udskriv.jsx)
3. Generate version number (Process: report-workflow.bpmn versioning)
4. Navigate to print view (Logical: React Router navigation)
5. Officer clicks print (Physical: Browser Print API)
6. PDF generated (Physical: Browser renderer)
7. Save to reports list (Development: LocalStorage write)

---

### Use Case 4: Multi-User Collaboration

**Scenario:** Multiple compliance officers work simultaneously

**Views Integration:**

| View | Artifact | Role in Scenario |
|------|----------|------------------|
| **Logical** | AuthProvider, ProtectedRoute | Per-user sessions |
| **Process** | complete-system-architecture.bpmn | Concurrent workflows |
| **Development** | Organization-based data isolation | Multi-tenancy logic |
| **Physical** | Supabase RLS, PostgreSQL row-level security | Data isolation |

**Flow:**
1. User A & B both log in (Physical: Separate JWT tokens)
2. Each loads their org's data (Logical: getUserOrganizations())
3. Concurrent edits (Process: Independent workflow instances)
4. Row-level security enforced (Physical: PostgreSQL RLS policies)
5. No conflicts (Development: Org-based data scoping)

---

## Summary: How Views Support Each Other

```
┌─────────────────────────────────────────────────────────────┐
│              4+1 VIEWS INTEGRATION MATRIX                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenarios (Use Cases)                                      │
│       ↓                                                     │
│       ├──► Logical View: WHAT functionality is needed       │
│       ├──► Process View: HOW it behaves at runtime          │
│       ├──► Development View: WHERE code is organized        │
│       └──► Physical View: WHERE it runs and deploys         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Integration Points

1. **Logical ↔ Development**
   - Each logical component maps to source files
   - Design patterns guide code organization

2. **Process ↔ Physical**
   - BPMN workflows show runtime interactions
   - Deployment topology supports concurrency

3. **Logical ↔ Physical**
   - Components deployed across client/server
   - Data layer abstracts storage location

4. **Development ↔ Process**
   - Code modules implement workflow steps
   - Service layer handles async operations

5. **Scenarios validate all views**
   - Each use case exercises multiple views
   - Ensures architectural consistency

---

## Stakeholder Coverage

| Stakeholder | Primary View | Secondary Views |
|-------------|-------------|-----------------|
| End Users | Scenarios | Logical |
| Business Analysts | Logical, Scenarios | Process |
| Developers | Development | Logical |
| Architects | All views | - |
| Testers | Scenarios | Process, Logical |
| DevOps | Physical | Development |
| Performance Engineers | Process | Physical |
| Security Officers | Physical | Logical, Process |

---

## Architecture Documentation Map

```
Our Documentation Suite:

├── 4+1-ARCHITECTURAL-VIEWS.md (this file)
│   └── High-level architecture framework
│
├── ARCHITECTURE.md
│   └── Detailed patterns, principles, and design decisions
│
├── SYSTEM-DESCRIPTION.md
│   └── System overview and technical specifications
│
├── BPMN-SYSTEM-ANALYSIS.md
│   └── Process modeling and workflow analysis
│
├── CRC-CARDS.md
│   └── Component responsibilities and collaborations
│
├── SOLID-PRINCIPLES.md
│   └── Object-oriented design principles application
│
└── src/models/BPMN/
    └── Executable process definitions
```

---

## References

- **Kruchten, Philippe (1995)**. "The 4+1 View Model of Architecture". IEEE Software 12 (6): 42–50.
- **BPMN 2.0 Specification**: Object Management Group (OMG)
- **Project Repository**: https://github.com/zakariyeyare/compliance-project

---

*Document Version: 1.0*  
*Last Updated: December 4, 2025*  
*Maintained by: Architecture Team*
