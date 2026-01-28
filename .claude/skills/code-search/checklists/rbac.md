# RBAC (Role-Based Access Control) Checklist

## Permission Matrix

- [ ] All permissions documented (resource.action format)
- [ ] Role-to-permission mapping defined
- [ ] Permission hierarchy clear
- [ ] Default permissions for new roles

## API Layer Protection

- [ ] Middleware checks permissions on protected routes
- [ ] Permission failures return 403
- [ ] Resource ownership verified
- [ ] Admin endpoints restricted to admin roles

## UI Layer Protection

- [ ] Pages wrapped with `RequireRole` component
- [ ] Actions conditional on permissions
- [ ] Menu items filtered by role
- [ ] Buttons disabled/hidden based on permissions

## Data Scoping

- [ ] Customer-scoped queries filter by customerId
- [ ] Team-scoped queries filter by team membership
- [ ] User-scoped queries filter by userId
- [ ] Cross-boundary access denied

## Dual-Layer Enforcement

- [ ] Every permission enforced at API layer
- [ ] Every permission enforced at UI layer
- [ ] No API-only enforcement
- [ ] No UI-only enforcement

## Permission Checks

- [ ] View permissions before read operations
- [ ] Create permissions before insert operations
- [ ] Update permissions before modify operations
- [ ] Delete permissions before remove operations

## Audit Trail

- [ ] Permission changes logged
- [ ] Access attempts logged
- [ ] Permission failures logged
- [ ] Role changes logged
