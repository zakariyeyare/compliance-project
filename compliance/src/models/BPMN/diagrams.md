# Compliance Project Process Diagrams (Mermaid Quick View)

## Complete System Collaboration Diagram
```mermaid
graph TB
    subgraph User["User / Compliance Officer"]
        U1[Open App] --> U2[Enter Credentials]
        U2 --> U3[Submit Login]
        U3 -.Login Request.-> A1
        A2 -.Auth Result.-> U4{Authorized?}
        U4 -->|Yes| U5[Access Dashboard]
        U5 --> U6[Create Report]
        U6 --> U7[Author Content]
        U7 --> U8[Submit for Approval]
        U8 -.Submit to Approver.-> AP1
        AP2 -.Approval Decision.-> U9{Approval Status}
        U9 -->|Approved| U10[View Published]
        U9 -->|Rejected| U7
        U5 --> U11[View Controls]
        U11 --> U12[Edit Policy]
        U10 --> U13[Request Export]
        U13 -.Export Request.-> W3
        W4 -.HTML Document.-> U14[View/Print]
        U14 --> U15((Session End))
    end
    
    subgraph WebApp["Compliance WebApp System"]
        W1[Establish Session]
        W2[Save Draft to LocalStorage]
        W3[Generate HTML Export]
        W4[Return HTML]
        W5[Save Policy to LocalStorage]
        W6[Publish Report]
    end
    
    subgraph Auth["Auth Backend Supabase"]
        A1[Validate Credentials]
        A2[Return Auth Result]
        A3[Create Account]
        A4[Send Confirmation]
    end
    
    subgraph Approver["Approver"]
        AP1[Review Report]
        AP2[Make Decision]
        AP1 --> AP2
    end
    
    U7 -.Save Draft.-> W2
    U12 -.Save Policy.-> W5
    U9 -.Publish.-> W6
    
    style User fill:#e1f5ff
    style WebApp fill:#fff4e1
    style Auth fill:#ffe1e1
    style Approver fill:#e1ffe1
```

## User Authentication
```mermaid
flowchart LR
  A[Open Login Page] --> B[Enter Credentials]
  B --> C[Submit Login]
  C --> D[Validate Credentials]
  D --> E{Authorized?}
  E -->|Yes| F[Establish Session]
  F --> G((Login Successful))
  E -->|No| H((Login Failed))
```

## User Registration
```mermaid
flowchart LR
  A[Open Register Page] --> B[Enter Registration Info]
  B --> C[Submit Registration]
  C --> D[Create Account]
  D --> E[Confirm Email]
  E --> F{Email Verified?}
  F -->|Yes| G((Account Created))
  F -->|No| E
```

## GDPR Report Lifecycle
```mermaid
flowchart LR
  A[Create New Report] --> B[Author Report Content]
  B --> C[Save Draft]
  C --> D[Submit for Approval]
  D --> E[Review Report]
  E --> F{Approval Outcome}
  F -->|Approved| G[Publish Report]
  G --> H((Report Published))
  F -->|Rejected| B
  B --> I{Allow Delete?}
  I -->|Status = Draft| J[Delete Report] --> K((Report Deleted))
```

## Compliance Overview Management
```mermaid
flowchart LR
  A[Open Compliance Overview] --> B[View Controls]
  B --> C[Toggle Control Details]
  C --> D[Edit Working Policy]
  D --> E[Save Policy]
  E --> F((Overview Updated))
```

## Report Export and Print
```mermaid
flowchart LR
  A[Open Report Page] --> B[Select Report]
  B --> C[Generate View HTML] --> D((HTML Generated))
  B --> E[Generate Print HTML] --> F[Print Document] --> G((Report Printed))
```

> Note: Mermaid is for quick visualization; BPMN XML files under `xml/` are canonical.
