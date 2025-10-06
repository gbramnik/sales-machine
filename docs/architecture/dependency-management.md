# Dependency Management

## Dependency Update Schedule

**Update Frequency:**
- **Security Patches:** Immediate (within 24h of CVE disclosure)
- **Minor Updates:** Monthly (first Monday of each month)
- **Major Updates:** Quarterly (evaluated for breaking changes)

**Automated Tools:**
- **Dependabot:** Enabled on GitHub for automatic security patch PRs
- **Renovate (Optional):** Can replace Dependabot for more granular control

**Update Process:**
```bash
# Monthly minor update workflow
# 1. Review Dependabot PRs
gh pr list --label dependencies

# 2. Test updates locally
npm update
npm run test
npm run build

# 3. Merge if tests pass
gh pr merge <pr-number> --squash

# 4. Deploy to staging first
git push origin main:staging

# 5. Monitor staging for 24h, then promote to production
```

**Breaking Change Evaluation (Major Updates):**
- Review CHANGELOG for migration guides
- Test in isolated branch
- Update architecture documentation if patterns change
- Schedule during low-traffic periods

**Dependency Audit:**
```bash
# Run quarterly security audit
npm audit

# Fix high/critical vulnerabilities
npm audit fix

# Review and update outdated dependencies
npm outdated
```

---
