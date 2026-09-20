# 7. Deployment View

<!-- arc42:section 07 -->

The central Control Plane deployment contains the GitHub App ingress, Actions
controller, self-hosted runner/session boundary, and protected controller
credentials. Origin repositories receive only the permissions and thin
integration needed for their own local workflows.

The Dev Container and Features are distributed from the Developer Distribution
context. `.github-private` is a private GitHub surface and is never a secret
store or runtime host.
