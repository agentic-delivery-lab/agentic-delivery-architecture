# 11. Risks and Technical Debt

<!-- arc42:section 11 -->

The maintained risk register is [`../risks/risks.yml`](../risks/risks.yml);
technical debt and exit conditions are in
[`../risks/technical-debt.yml`](../risks/technical-debt.yml).

The current risks include unproved App access to the configured private
portfolio, unavailable native Issue Priority projection, unverified field
pinning, mismatch between installation selection and the Control Plane
contract, incomplete end-to-end delivery evidence, and repository-specific
protection gaps. Initial portfolio configuration resolved the historical
absence of a Project; it did not resolve runtime integration. Source anomalies
and their dated evidence remain in the registers and the
[current gap matrix](../references/strategy-foundation-gap-matrix.md).

Evaluation integrity and bounded operation are additional open risks: no
representative holdout corpus, grader calibration evidence, or independent
comparative review is recorded, and no accepted per-run receipt proves hard
time/invocation limits, observable quota usage, or safe recovery across the
webhook, Actions/Codex, and replay boundaries. QR-017–QR-019 remain target
scenarios until their owning contexts supply implementation and runtime
evidence.

This chapter separates observed risks from target controls. A validated source
manifest or passing unit test does not close a live entitlement or execution
risk. Risk closure requires an immutable run, API result, review record, or
operator evidence appropriate to the claim.

**Evidence:** observations are dated in
[`system-evidence.yml`](../references/system-evidence.yml); external
source anomalies and their current owners remain in the registers.

TD-006 tracks the gap between the AP-003 workspace lifecycle and proven
implementation across supported execution profiles. Leaking fixture producers
need immediate teardown; periodic sweeping alone does not close that debt.
