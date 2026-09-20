# 6. Runtime View

<!-- arc42:section 06 -->

The primary runtime sequence is:

```text
GitHub event -> App webhook -> signed envelope -> participant preflight
-> semantic proposal -> deterministic authorization -> origin mutation
-> evidence/write-back
```

Conversation-driven execution additionally requires the explicit invocation
boundary. An event is not itself a lifecycle transition; the versioned
lifecycle policy decides whether it is ignored, observed, routed, or authorized.

The runtime sequence is represented in
`../diagrams/mermaid/issue-delivery-sequence.mmd` when that source is added.
