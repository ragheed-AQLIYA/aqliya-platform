# Sunbul Multi-Client Architecture

**Version:** 0.1
**Status:** Conceptual — must be validated before implementation

---

## Multi-Client Model

Sunbul uses a **tenant-per-client** isolation model at the application layer. Each client (tenant) operates in a logically isolated workspace within the same deployment. All data access is guarded by a mandatory tenant filter that prevents cross-client data leakage.

### Architecture Levels

```
Deployment (Sunbul Instance)
├── Platform Admin (super-admin users)
├── Client A (tenant)
│   ├── Users (with roles scoped to Client A)
│   ├── Records / Cases
│   ├── Documents / Files (in Client A storage path)
│   ├── Audit Log (Client A only)
│   ├── Configuration (Client A settings)
│   └── Integrations (future — Client A specific)
├── Client B (tenant)
│   ├── Users
│   ├── Records
│   ├── Documents
│   ├── Audit Log
│   ├── Configuration
│   └── Integrations
└── Client N (... repeat)
```

### Isolation Boundary

| Data Type | Isolation Mechanism | Cross-Client Access |
|---|---|---|
| Records / Cases | `clientId` foreign key on every record table | Blocked by tenant guard |
| Users | `UserClientMembership` join table scopes user to client with role | User can belong to multiple clients; session scoped |
| Documents / Files | Storage path by `clientId`; DB records scoped by `clientId` | Blocked by tenant guard |
| Audit Logs | `clientId` on every audit entry | Blocked by tenant guard |
| Configuration | Per-client config table or JSON column | Blocked by tenant guard |
| Integrations | Per-client integration storage (future) | Blocked by tenant guard |

## Tenant / Workspace Structure

### Client Entity
- `id` — unique identifier
- `name` — client/tenant name
- `slug` — URL-safe identifier
- `status` — active, suspended, archived
- `contactEmail` — primary contact
- `contactPhone` — optional
- `industry` — classification
- `notes` — internal notes (visible to platform admin only)
- `config` — JSON configuration (per-client settings)
- `createdAt`, `updatedAt`, `deletedAt` (soft delete)

### Per-Client Configuration
- Language preference (default: Arabic)
- Timezone
- Date format
- Number format
- Default record types (if configurable)
- Approval rules (single vs. multiple approvers)
- Export template preferences
- Notification preferences (future)

## Data Isolation Principles

1. **Every data table** that holds client-scoped data MUST have a `clientId` column
2. **Every query** MUST include a `clientId = :currentClientId` filter
3. **Tenant guard middleware** MUST intercept every server action and API call to verify the requesting user's client scope
4. **No default/fallback** behavior that bypasses tenant guard
5. **Cross-client admin operations** are restricted to Platform Admin role only
6. **Storage isolation** for uploaded files uses path structure: `{deploymentId}/clients/{clientId}/{recordId}/{filename}`
7. **Audit logs** are client-scoped; platform admin can view all, client roles view only their own client's logs

### Tenant Guard Implementation Pattern

Every server action must verify:

```typescript
function requireClientAccess(userId: string, clientId: string, requiredRole?: string) {
  // 1. Verify user has membership in this client
  // 2. Verify user has the required role (if specified)
  // 3. Verify client is active
  // 4. Throw/return error if any check fails
}
```

## User / Role Model

See `sunbul-user-roles-permissions.md` for full details.

At the multi-client level:

- A **Platform Admin** exists outside any client and can manage all clients.
- A **Client User** belongs to one or more clients via a membership record.
- Each membership has a **role** within that client.
- A user's session determines which client they are currently operating in.
- Switching clients requires re-authorization (the session scope changes).

## File / Evidence Isolation

- File storage path: `clients/{clientId}/records/{recordId}/{filename}`
- File metadata (name, size, type, hash, storageKey) stored in DB with `clientId` and `recordId`
- Evidence is stored as a type of record-associated metadata (a note/link attached to a record)
- Evidence can reference uploaded files within the same client scope
- No file or evidence from one client is accessible from another client's context

## Audit Log Isolation

- Audit events stored with: `clientId`, `actorId`, `action`, `targetType`, `targetId`, `before`, `after`, `timestamp`
- Queryable per client (client roles)
- Admin can query all clients
- Exportable per client
- Immutable — no deletion or modification after creation

## Future Client-Specific Integrations

The architecture must allow for per-client integration configuration without affecting other clients:

- **Plug-in model**: integration adapters registered per client
- **Integration config**: stored in client configuration (not hardcoded)
- **Rate limiting**: per-client independent rate limits
- **Credentials**: stored per-client with encryption
- **Webhook targets**: per-client event subscriptions (future)

The integration model is NOT in MVP scope but must be architecturally supported by the data isolation approach.
