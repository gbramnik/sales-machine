---
title: "Database Performance Degradation"
category: "database"
keywords: ["database", "performance", "slow queries", "connection pool", "supabase", "postgresql"]
last_updated: "2025-01-17"
---

# Database Performance Degradation

## Problem

**Problem Description:**
Database performance degrades significantly, resulting in slow queries, connection pool exhaustion, high CPU/memory usage, and increased API response times.

**Symptoms:**
- API response times increase (> 500ms p95)
- Database queries timeout
- Connection pool exhausted errors
- High database CPU/memory usage
- Slow dashboard loading
- Database connection errors

## Diagnosis Steps

1. **Check database performance metrics (Supabase dashboard)**
   - Navigate to Supabase dashboard: https://app.supabase.com
   - Go to Project → Database → Performance
   - Review:
     - CPU usage
     - Memory usage
     - Connection pool usage
     - Query performance (slow queries)
     - Active connections

2. **Review slow query logs**
   ```sql
   -- Query slow queries (if pg_stat_statements enabled)
   SELECT 
     query,
     calls,
     total_exec_time,
     mean_exec_time,
     max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```
   - Identify queries with high execution time (> 100ms)
   - Check query frequency
   - Review query execution plans

3. **Check connection pool**
   ```sql
   -- Check active connections
   SELECT 
     count(*) as active_connections,
     max_conn as max_connections
   FROM pg_stat_activity, 
        (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') mc;
   ```
   - Verify connection pool size
   - Check active connections
   - Review connection pool exhaustion errors

4. **Check database indexes**
   ```sql
   -- List indexes on a table
   SELECT 
     indexname,
     indexdef
   FROM pg_indexes
   WHERE tablename = 'prospects'
   ORDER BY indexname;
   ```
   - Verify indexes exist on frequently queried fields
   - Check index usage (unused indexes)
   - Review index performance

5. **Check database size**
   ```sql
   -- Check database size
   SELECT 
     pg_size_pretty(pg_database_size(current_database())) as database_size;
   
   -- Check table sizes
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```
   - Verify database size (storage usage)
   - Check table sizes
   - Review data growth trends

6. **Check for database locks**
   ```sql
   -- Check for locks
   SELECT 
     blocked_locks.pid AS blocked_pid,
     blocking_locks.pid AS blocking_pid,
     blocked_activity.usename AS blocked_user,
     blocking_activity.usename AS blocking_user,
     blocked_activity.query AS blocked_statement,
     blocking_activity.query AS blocking_statement
   FROM pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
   JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
   WHERE NOT blocked_locks.granted;
   ```
   - Review lock contention
   - Check for long-running transactions
   - Review deadlock logs

## Resolution Steps

### Immediate Actions

1. **Increase connection pool size (if exhausted)**
   - Navigate to Supabase dashboard → Settings → Database
   - Increase connection pool size (if available)
   - **Note:** Supabase connection pool limits depend on plan tier

2. **Kill long-running queries (if blocking)**
   ```sql
   -- Find long-running queries
   SELECT 
     pid,
     now() - pg_stat_activity.query_start AS duration,
     query
   FROM pg_stat_activity
   WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
     AND state = 'active';
   
   -- Kill query (replace PID)
   SELECT pg_terminate_backend(PID);
   ```
   - Identify blocking queries
   - Terminate long-running queries (with caution)

3. **Restart database (if severe performance issues)**
   - Navigate to Supabase dashboard → Settings → Database
   - Restart database (if available)
   - **Warning:** This will disconnect all active connections

### Short-term Actions

1. **Add missing indexes (see Story 6.3, Task 6)**
   ```sql
   -- Add index on frequently queried field
   CREATE INDEX IF NOT EXISTS idx_prospects_created_at 
   ON prospects(created_at DESC);
   ```
   - Review migration: `supabase/migrations/20250117_add_performance_indexes.sql`
   - Apply missing indexes
   - Monitor query performance improvement

2. **Optimize slow queries**
   - Review query execution plans
   - Rewrite queries for better performance
   - Add indexes to support query patterns
   - Use EXPLAIN ANALYZE to identify bottlenecks

3. **Remove unused indexes**
   ```sql
   -- Find unused indexes
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan as index_scans
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```
   - Identify unused indexes
   - Remove unused indexes (with caution)

4. **Analyze and vacuum database (PostgreSQL maintenance)**
   ```sql
   -- Analyze tables
   ANALYZE prospects;
   ANALYZE campaigns;
   ANALYZE meetings;
   
   -- Vacuum tables
   VACUUM ANALYZE prospects;
   VACUUM ANALYZE campaigns;
   VACUUM ANALYZE meetings;
   ```
   - Run ANALYZE to update statistics
   - Run VACUUM to reclaim storage

### Long-term Actions

1. **Implement query caching (Redis)**
   - Cache frequently accessed data in Upstash Redis
   - Implement cache invalidation strategy
   - Monitor cache hit rates

2. **Optimize database schema**
   - Normalize or denormalize as needed
   - Review foreign key constraints
   - Optimize data types

3. **Implement database connection pooling (PgBouncer)**
   - Supabase includes PgBouncer by default
   - Verify connection pooling is enabled
   - Monitor connection pool usage

4. **Scale database (upgrade plan, read replicas)**
   - Upgrade Supabase plan if needed
   - Consider read replicas for read-heavy workloads
   - Review database resource limits

5. **Implement database monitoring (Story 6.1)**
   - Set up database performance monitoring
   - Configure alerts for slow queries
   - Monitor connection pool usage

### Query Optimization

1. **Review query execution plans**
   ```sql
   -- Explain query execution plan
   EXPLAIN ANALYZE
   SELECT * FROM prospects 
   WHERE user_id = 'USER_ID' 
   ORDER BY created_at DESC 
   LIMIT 50;
   ```
   - Use EXPLAIN ANALYZE to identify bottlenecks
   - Review execution plan for full table scans
   - Check for missing indexes

2. **Add indexes on frequently queried fields**
   - Review Story 6.3 for index recommendations
   - Add composite indexes for common query patterns
   - Monitor index usage

3. **Optimize JOIN operations**
   - Use appropriate JOIN types
   - Add indexes on JOIN columns
   - Review JOIN order

4. **Use query hints (if needed)**
   - PostgreSQL supports query hints via extensions
   - Use hints sparingly (prefer index optimization)

5. **Implement pagination for large result sets**
   - Use LIMIT and OFFSET for pagination
   - Consider cursor-based pagination for large datasets
   - Avoid loading all records at once

## Prevention

- Monitor database performance metrics daily
- Set up alerts for slow queries (> 500ms)
- Set up alerts for connection pool exhaustion
- Regularly review and optimize queries
- Implement database indexing strategy (Story 6.3)
- Regularly analyze and vacuum database
- Monitor database size and growth
- Review query performance after schema changes
- Test query performance under load (Story 6.3)

## Related Runbooks

- [Load Testing & Performance Validation](../../stories/6.3.load-testing-performance-validation.md)
- [Monitoring Setup](../monitoring/monitoring-setup.md)

## Additional Resources

- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [PostgreSQL Indexing](https://www.postgresql.org/docs/current/indexes.html)



