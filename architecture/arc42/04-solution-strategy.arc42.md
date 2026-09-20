# 4. Solution Strategy

<!-- arc42:section 04 -->

The selected strategy is a central, organization-wide Delivery Control Plane
with explicit participant enrollment. A signed event identifies the originating
repository by immutable repository ID; semantic routing proposes work; deterministic
authorization validates the proposal; only then may the controller mutate the
origin issue or execution branch.

Architecture releases and Primitive releases are immutable inputs. Public
organization defaults, member publication, and developer distribution are
separate adapters with no copied authoritative state.
