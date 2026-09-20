# 2. Architecture Constraints

<!-- arc42:section 02 -->

The system is constrained by GitHub's native repository and organization
surfaces, protected `main` branches, pull-request review, least-privilege App
permissions, and the distinction between public `.github` and private
`.github-private` behavior.

The organization is not assumed to have enterprise Copilot governance or
private-repository protection until entitlement evidence is recorded in the
architecture release.
