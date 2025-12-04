# CRC Cards - Compliance Management System

## Class-Responsibility-Collaboration Analysis

---

```
┌─────────────────────────────────────────────────────────────────┐
│                        AuthProvider                             │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Manage authentication state (user, loading)                  │
│  • Handle sign-in/sign-up/sign-out operations                   │
│  • Listen to authentication state changes                       │
│  • Create user organizations                                    │
│  • Provide auth context to entire app                           │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → Supabase (SupabaseClient)                                    │
│  → AuthContext (AuthContextBase)                                │
│  ← useAuth hook (consumers)                                     │
│  ← Login, Register, ProtectedRoute                              │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                      ProtectedRoute                             │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Verify user authentication before rendering                  │
│  • Display loading state during auth check                      │
│  • Redirect unauthenticated users to login                      │
│  • Protect private routes from unauthorized access              │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → useAuth hook                                                 │
│  → Navigate (react-router-dom)                                  │
│  ← Dashboard, GDPRDashboard, Reports (protected screens)        │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                   gdprSupabaseService                           │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Fetch GDPR structure (standards → controls → subcontrols)    │
│  • Save/update working policies                                 │
│  • Get user organizations                                       │
│  • Manage policy documents and versions                         │
│  • Calculate compliance statistics                              │
│  • Handle bulk policy operations                                │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → Supabase (SupabaseClient)                                    │
│  ← GDPRDashboard, ComplianceOverview, Udskriv                   │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                     SupabaseClient                              │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Provide single Supabase client instance (Singleton)          │
│  • Configure backend connection (URL, API key)                  │
│  • Enable auth, database, and realtime operations               │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → Supabase BaaS (external)                                     │
│  ← AuthProvider                                                 │
│  ← gdprSupabaseService                                          │
│  ← All screen components                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                      Login Screen                               │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Display login form UI                                        │
│  • Validate email/password input                                │
│  • Handle form submission                                       │
│  • Show error messages                                          │
│  • Navigate to dashboard on success                             │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → useAuth hook                                                 │
│  → useNavigate (react-router-dom)                               │
│  ← AuthProvider (provides signIn method)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    GDPRDashboard                                │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Display GDPR control hierarchy                               │
│  • Allow users to create/edit policies                          │
│  • Save policies to LocalStorage                                │
│  • Calculate completion statistics                              │
│  • Manage expand/collapse of controls                           │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → gdprSupabaseService                                          │
│  → LocalStorage (browser API)                                   │
│  → Layout component                                             │
│  ← useAuth hook                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                   ComplianceOverview                            │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Display completed policies summary                           │
│  • Create compliance reports                                    │
│  • Manage report versions                                       │
│  • Calculate compliance percentages                             │
│  • Navigate to print/export view                                │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → gdprSupabaseService                                          │
│  → LocalStorage (browser API)                                   │
│  → useNavigate (react-router-dom)                               │
│  → Layout component                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                        Layout                                   │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Provide consistent page structure                            │
│  • Display navigation bar                                       │
│  • Show user info and logout button                             │
│  • Render page content (children)                               │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → useAuth hook                                                 │
│  ← All screen components (Dashboard, GDPR, Reports, etc.)       │
└─────────────────────────────────────────────────────────────────┘
```

---

```
┌─────────────────────────────────────────────────────────────────┐
│                       useAuth Hook                              │
├─────────────────────────────────────────────────────────────────┤
│ RESPONSIBILITIES:                                               │
│  • Provide simplified access to AuthContext                     │
│  • Throw error if used outside AuthProvider                     │
│  • Abstract authentication logic from components                │
├─────────────────────────────────────────────────────────────────┤
│ COLLABORATORS:                                                  │
│  → AuthContext (AuthContextBase)                                │
│  ← All components needing auth (Login, Layout, ProtectedRoute)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Collaboration Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                      APPLICATION STARTUP                             │
└──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AuthProvider      │◄──────┐
                    │  (wraps entire app) │       │
                    └──────────┬──────────┘       │
                               │                  │
                               │ provides         │ uses
                               ▼                  │
                    ┌─────────────────────┐       │
                    │    useAuth Hook     │───────┘
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │ProtectedRoute│   │    Login     │  │   Layout     │
    └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
           │                  │                  │
           │ protects         │ navigates to     │ wraps
           ▼                  ▼                  ▼
    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │GDPRDashboard │   │  Dashboard   │  │Screen Content│
    └──────┬───────┘   └──────────────┘  └──────────────┘
           │
           │ uses
           ▼
    ┌──────────────────────┐
    │ gdprSupabaseService  │
    └──────────┬───────────┘
               │
               │ uses
               ▼
    ┌──────────────────────┐
    │  SupabaseClient      │
    │    (Singleton)       │
    └──────────┬───────────┘
               │
               │ connects to
               ▼
    ┌──────────────────────┐
    │   Supabase BaaS      │
    │ (External Backend)   │
    └──────────────────────┘
```

---

## Key CRC Patterns in Your System

### 1. **Provider Pattern**
- `AuthProvider` has responsibility to manage auth state
- Collaborates with all components via `useAuth` hook

### 2. **Facade Pattern**
- `gdprSupabaseService` has responsibility to hide complex queries
- Collaborates with screen components by providing simple methods

### 3. **Singleton Pattern**
- `SupabaseClient` has responsibility to provide one instance
- Collaborates with all services/components needing backend access

### 4. **Higher-Order Component**
- `ProtectedRoute` has responsibility to guard routes
- Collaborates with `useAuth` and child components

### 5. **Custom Hook**
- `useAuth` has responsibility to abstract context access
- Collaborates with `AuthContext` and consuming components

---

*Generated: December 4, 2025*
