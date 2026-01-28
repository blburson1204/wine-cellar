# Database Health & Performance Checklist

## Query Performance

- [ ] No N+1 queries
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Composite indexes for multi-column queries
- [ ] EXPLAIN ANALYZE for slow queries

## Schema Design

- [ ] Normalization appropriate
- [ ] Foreign key constraints defined
- [ ] Check constraints for validation
- [ ] Default values set
- [ ] NOT NULL constraints appropriate

## Connection Management

- [ ] Connection pooling configured
- [ ] Pool size appropriate for load
- [ ] Connection timeout set
- [ ] Idle connection handling
- [ ] Connection leak detection

## Transaction Management

- [ ] Transactions for multi-step operations
- [ ] Transaction isolation level appropriate
- [ ] Rollback on errors
- [ ] Transaction timeout configured
- [ ] Avoid long-running transactions

## Data Integrity

- [ ] Unique constraints enforced
- [ ] Referential integrity maintained
- [ ] Cascade deletes configured correctly
- [ ] Orphaned records prevented
- [ ] Data validation at DB level

## Migrations

- [ ] Migration tested on staging
- [ ] Rollback script provided
- [ ] Data transformation verified
- [ ] Performance impact assessed
- [ ] Idempotent migrations

## Monitoring

- [ ] Slow query log enabled
- [ ] Connection pool metrics tracked
- [ ] Disk usage monitored
- [ ] Query performance tracked
- [ ] Lock contention monitored

## Backup & Recovery

- [ ] Automated backups configured
- [ ] Backup tested regularly
- [ ] Recovery time documented
- [ ] Point-in-time recovery available
- [ ] Backup retention policy defined
