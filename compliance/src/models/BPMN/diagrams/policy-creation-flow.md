# Policy Creation Flow

This diagram shows the three-layer architecture: User, WebApp, and Data.

```mermaid
graph TB
    subgraph USER["👤 USER LAYER"]
        Start(( ))
        Start --> U1[Select GDPR activity]
        U1 --> U2[Type/edit policy text]
        U2 --> U3[Click Save button]
        U3 --> U4[View updated version history]
        U4 --> End(( ))
    end
    
    subgraph WEBAPP["🌐 WEBAPP LAYER - React Frontend"]
        U1 --> W1[Fetch policy template]
        W1 --> D1
        D2 --> W2[Display policy editor]
        W2 --> U2
        U2 -.onChange.-> W3[Auto-save to LocalStorage]
        W3 -.every 2 sec.-> W3
        U3 --> W4[Validate policy data]
        W4 --> W5[Prepare version payload]
        W5 --> D3
        D4 --> W6[Refresh UI components]
        W6 --> U4
    end
    
    subgraph DATA["💾 DATA LAYER - Supabase + LocalStorage"]
        D1[Query: SELECT template<br/>FROM gdpr_activities]
        D1 --> D2[Return policy structure]
        D3[INSERT INTO policy_versions]
        D3 --> D4[Return new version record]
        LS1[(LocalStorage<br/>gdpr_drafts)]
        W3 -.-> LS1
        LS1 -.restore on reload.-> W2
    end
    
    End
    
    style USER fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px
    style WEBAPP fill:#E3F2FD,stroke:#1565C0,stroke-width:3px
    style DATA fill:#F3E5F5,stroke:#6A1B9A,stroke-width:3px
    style Start fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style End fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style W3 fill:#FF9800,stroke:#E65100,stroke-width:2px
    style LS1 fill:#FFE0B2,stroke:#E65100,stroke-width:2px
    style D3 fill:#CE93D8,stroke:#6A1B9A,stroke-width:2px
```

## Flow Description

1. **User selects GDPR activity** - User chooses which compliance area to work on
2. **System loads structure from Supabase** - Pre-defined policy template/structure loaded
3. **User edits text** - User customizes policy content
4. **Draft saved in LocalStorage** - Auto-save for performance and offline capability
5. **User saves policy** - User explicitly commits changes
6. **Create version in database** - New version stored in Supabase
7. **UI updates version history** - Interface shows new version in history list

## Storage Strategy

- **LocalStorage**: Fast, temporary drafts for editing performance
- **Supabase Database**: Permanent, versioned policy storage

## Components Involved

- **User**: Creates and edits policy content
- **WebApp**: Manages UI and local storage
- **Supabase**: Stores policy structures and versions
- **LocalStorage**: Temporary draft storage
