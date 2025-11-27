# Complete Compliance System - BPMN Collaboration Diagram

## Overview
This diagram shows the entire compliance system with all participants (pools) and their interactions via message flows.

## Participants (Pools)
1. **User / Compliance Officer** - End users interacting with the system
2. **Compliance WebApp (System)** - Frontend application and storage layer
3. **Auth Backend (Supabase)** - Authentication and user management
4. **Approver** - Report review and approval authority

## Key Processes

### Authentication Flow
- User enters credentials → Auth backend validates → Session established
- Registration: User submits info → Account created → Email confirmation

### Report Lifecycle Flow
- User creates and authors report content
- Draft saved to LocalStorage (WebApp)
- Report submitted to Approver
- Approver reviews and makes decision
- If approved: Report published
- If rejected: User revises content

### Compliance Management Flow
- User accesses dashboard
- Views GDPR controls
- Edits working policies
- System saves to LocalStorage

### Export/Print Flow
- User requests report export
- WebApp generates HTML document
- User views or prints document

## Message Flows (Cross-Pool Communication)
1. **Login Request** - User → Auth Backend
2. **Auth Result** - Auth Backend → User
3. **Registration Request** - User → Auth Backend
4. **Confirmation Link** - Auth Backend → User
5. **Submit Report for Approval** - User → Approver
6. **Approval Decision** - Approver → User
7. **Export Request** - User → WebApp
8. **HTML Document** - WebApp → User

## Data Storage
- **LocalStorage Keys:**
  - `gdpr_reports` - Draft and published reports
  - `gdpr_saved_policies` - Compliance policy content

## File Location
`src/models/BPMN/xml/complete-system-collaboration.bpmn`

## Usage
Open in:
- Camunda Modeler
- bpmn.io (https://demo.bpmn.io)
- Any BPMN 2.0 compatible viewer

The diagram includes full DI (Diagram Interchange) for proper rendering with pools, lanes, and message flows.
