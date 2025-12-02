# Authentication Flow

This diagram shows the three-layer architecture: User, WebApp, and Data.

```mermaid
graph TB
    subgraph USER["👤 USER LAYER"]
        Start(( ))
        Start --> |Enter credentials| U1[Input: Email & Password]
        U1 --> U2[Click Login Button]
        T6[View error message]
        T5[Access Dashboard]
        T5 --> End1(( ))
        T6 --> End2(( ))
    end
    
    subgraph WEBAPP["🌐 WEBAPP LAYER - React Frontend"]
        U2 --> W1[Collect form data]
        W1 --> W2[Call Supabase Auth API]
        W2 --> D1
        D2 --> W3{Auth Success?}
        W3 -->|Yes| W4[Update AuthContext state]
        W4 --> W5[Store session token]
        W5 --> W6[Navigate to /dashboard]
        W6 --> T5
        W3 -->|No| W7[Display error to user]
        W7 --> T6
    end
    
    subgraph DATA["💾 DATA LAYER - Supabase Backend"]
        D1[Receive auth request]
        D1 --> D2[Validate credentials]
        D2 --> D3[Query user table]
        D3 --> D4{User exists &<br/>password valid?}
        D4 -->|Yes| D5[Generate session token]
        D5 --> D6[Store session in auth.sessions]
        D6 --> W3
        D4 -->|No| W3
    end
    
    End1(( ))
    End2(( ))
    
    style USER fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px
    style WEBAPP fill:#E3F2FD,stroke:#1565C0,stroke-width:3px
    style DATA fill:#F3E5F5,stroke:#6A1B9A,stroke-width:3px
    style Start fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style End1 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style End2 fill:#F44336,stroke:#B71C1C,stroke-width:3px
    style D4 fill:#FFD54F,stroke:#F57F17,stroke-width:2px
    style W3 fill:#FFD54F,stroke:#F57F17,stroke-width:2px
```

## Flow Description

1. **User enters credentials** - User provides email and password on login page
2. **WebApp sends credentials to Supabase** - Frontend submits authentication request
3. **Supabase validates credentials** - Backend verifies user identity
4. **Credentials valid?** - Decision point based on validation result
   - **Yes Path:**
     - Session created by Supabase
     - AuthContext updates UI state
     - User redirected to Dashboard
   - **No Path:**
     - Error message displayed to user

## Components Involved

- **User**: Initiates login process
- **WebApp**: React frontend application
- **Supabase**: Authentication backend service
- **AuthContext**: React context managing authentication state
