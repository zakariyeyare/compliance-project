# Report Workflow

This diagram shows the three-layer architecture with an additional Approver layer.

```mermaid
graph TB
    subgraph USER["👤 USER LAYER"]
        Start(( ))
        Start --> U1[Select policies for report]
        U1 --> U2[Click 'Compile Report']
        U2 --> U5
        U5[View approval status]
        U7[Receive rejection notification]
        U6[Click 'Print PDF']
        U6 --> End1(( ))
        U7 --> End2(( ))
    end
    
    subgraph APPROVER["✅ APPROVER LAYER"]
        A1[Open report for review]
        A1 --> A2{Decision:<br/>Approve or Reject?}
        A2 -->|Approve| A3[Click Approve]
        A2 -->|Reject| A4[Add rejection comments]
        A4 --> A5[Click Reject]
    end
    
    subgraph WEBAPP["🌐 WEBAPP LAYER - React Frontend"]
        U2 --> W1[Generate report HTML]
        W1 --> W2[Create draft entry]
        W2 --> D1
        D2 --> W3[Notify approver]
        W3 --> A1
        A3 --> W4[Update report status]
        A5 --> W8[Update report status]
        W4 --> D3
        W8 --> D5
        D4 --> W5[Enable export button]
        W5 --> U5
        D6 --> W9[Show notification]
        W9 --> U7
        U6 --> W6[Generate PDF]
        W6 --> W7[Open print dialog]
        W7 --> End1
    end
    
    subgraph DATA["💾 DATA LAYER - Supabase"]
        D1[INSERT INTO reports<br/>status: 'draft']
        D1 --> D2[Return report_id]
        D3[UPDATE reports<br/>SET status='approved'<br/>locked=true]
        D3 --> D4[Return updated record]
        D5[UPDATE reports<br/>SET status='rejected']
        D5 --> D6[Return rejection record]
    end
    
    End1(( ))
    End2(( ))
    
    style USER fill:#E8F5E9,stroke:#2E7D32,stroke-width:3px
    style APPROVER fill:#FFF3E0,stroke:#E65100,stroke-width:3px
    style WEBAPP fill:#E3F2FD,stroke:#1565C0,stroke-width:3px
    style DATA fill:#F3E5F5,stroke:#6A1B9A,stroke-width:3px
    style Start fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style End1 fill:#4CAF50,stroke:#1B5E20,stroke-width:3px
    style End2 fill:#F44336,stroke:#B71C1C,stroke-width:3px
    style A2 fill:#FFD54F,stroke:#F57F17,stroke-width:2px
    style D3 fill:#CE93D8,stroke:#6A1B9A,stroke-width:2px
```

## Flow Description

1. **User compiles report** - User selects existing policy versions to include
2. **System creates draft report** - WebApp generates draft from selected policies
3. **Approver reviews report** - Designated approver examines content
4. **Approved?** - Decision point for approval
   - **Yes Path:**
     - Report is locked (no further edits)
     - Report becomes exportable
     - User can print PDF via browser
     - Report marked as published
   - **No Path:**
     - Approver rejects with feedback
     - User is notified of rejection

## Report States

- **Draft**: Editable, not approved
- **Approved**: Locked, exportable
- **Published**: Final, locked, exportable

## Components Involved

- **User**: Compiles reports and exports PDFs
- **Approver**: Reviews and approves/rejects reports
- **WebApp**: Manages report lifecycle and PDF generation
- **Supabase**: Stores report data and approval status
