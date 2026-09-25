# 11. Risks and Technical Debt

<!-- arc42:section 11 -->

The maintained risk register is [`../risks/risks.yml`](../risks/risks.yml);
technical debt and exit conditions are in
[`../risks/technical-debt.yml`](../risks/technical-debt.yml).

The highest current risks are unverified organization field pinning, mismatch
between the App installation and the Control Plane contract, failure of live
issue intake on recovery issues, lack of end-to-end execution evidence, and
repository-by-repository gaps in live protection evidence. The Primitive main
release manifest also contains a source commit that did not resolve in the
live repository, although the digest reproduced at the valid commit pinned by
Architecture. Each item has an owner and source in the register.

This chapter separates observed risks from target controls. A validated source
manifest or passing unit test does not close a live entitlement or execution
risk. Risk closure requires an immutable run, API result, review record, or
operator evidence appropriate to the claim.

**Evidence:** observations are dated in
[`system-evidence.yml`](../references/system-evidence.yml); external
source anomalies and their current owners remain in the registers.
