# Regression checks

`npm test` runs dependency-free VM/DOM-fixture checks against the shipped source:

- First-column title centering, returning from other columns, viewport resizing, manual browsing, pointer/focus handling, sibling horizontal stability and branch separation.
- Cancellation of follow-up writes after unload, view exit and re-entry; native Enter creates a sibling only after the native text is saved, without overwriting existing block text.
- Keyboard boundaries, selection/IME/modifier exclusions, held-arrow prevention, parent-child ownership and sibling edges.
- Load/unload/reload, command removal, native preference writes, listener and DOM cleanup.

`npm run test:browser` runs an optional Playwright/Chromium fixture using the complete shipped CSS and JavaScript. Install Playwright and Chromium first. It does not connect to a real graph.

The dependency-free checks passed for 1.1.3, including independent column scrolling, tall-group alignment, shared surfaces, flush parent-child surfaces and unrelated branch separation. The optional Chromium test could not run in the release workspace because Chromium was unavailable and the browser download was blocked; it is not counted as passed. The author confirmed the visual layout and interactions in a live Roam graph before publication.

# Prior Depot review concerns checked

- Reading Desk #1541: no repair/import plan, file deletion or referenced-block deletion operations exist here. There are no whole-graph prefix queries. Existing block text is left to Roam's native editor. All plugin block mutations pass through a session/unload guard; already-submitted writes cannot be cancelled.
- Folio #1542: a branch moves as one subtree, rather than moving each descendant independently. Left/right navigation is off by default and scoped to the active board; text-boundary checks and popup/IME/modifier exclusions remain in place.
- Cleanup: command callbacks become inert when disposed, registered DOM listeners and observers are removed, queued focus work is invalidated, scheduled UI timers are cleared, and download object URLs are revoked.
