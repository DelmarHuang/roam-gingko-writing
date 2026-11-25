# 1.1.8

- Fix the 1.1.6–1.1.7 exit regression when themes obscure native Zen state: pair a dispatched entry command with one exit command instead of aborting with an unknown-state notice.
- Record session ownership only after dispatch; do not repeat an exit or reverse a visibly failed entry.
- Keep synthetic Escape removed. Desktop fullscreen verification remains pending.

# 1.1.7

- Apply native widget width and scrolling safeguards whenever Gingko is active, regardless of Folio state. Roam full-width negative margins and table footer minimum widths are not Folio-specific.
- Keep only Folio aside positioning behind Folio detection.
- Exclude widget internals from the column layout for every theme.
- Retain 1.1.6 Zen exit safeguards.

# 1.1.6

- Remove synthetic Escape from command-palette fallback; dismiss only the palette overlay, and avoid sending fallback chords while a palette remains open.
- Do not toggle Zen when already off; do not guess on exit when its state is unknown.
- Add regression checks for Zen transitions and absence of fullscreen calls. Native macOS fullscreen verification is pending.

# 1.1.5

- Inspect the live TODO page: confirm the kanban outer `.rm-full-width` host adds 116px through a negative margin; the data-table footer has an inline 500px minimum width inside a 375px content area.
- Reset full-width host margins and constrain the `:q` host and footer; allow pagination controls to wrap.
- Let the actual kanban column container receive horizontal wheel/touch scrolling.
- Keep data tables intrinsically wide within their scroll viewport instead of compressing all columns into the card.
- Audit Folio component CSS and add scoped sizing for quotes, callouts, PDF containers and sliders. Sidebar, calendar, settings and portal styles remain outside this override scope.
- Automated regression checks pass. Live-page diagnosis completed; the new package still needs live rendering verification after installation.

# 1.1.4

- Automatically scope Folio compatibility to the active Gingko board; respond to stylesheet and appearance changes without polling.
- Bound text, highlight backgrounds, media and embedded widgets to card width; preserve internal horizontal scrolling for wide widgets.
- Keep widget-internal rows out of the column layout; retain cross-column native child blocks.
- Restore normal Folio styling on exit and remove the appearance listener and observer on unload.
- Validation: automated layout, navigation, drag, mutation, lifecycle and Folio state/scroll tests; live Folio visual verification pending.

# Changelog

## 1.1.3

- Restore full text opacity on hover for every block role and the page title, not only unrelated branches.
- Keep the active branch and background unchanged while hovering.

## 1.1.2

- Isolate bullet-drag pointer and mouse gestures from Roam range selection while retaining native HTML drag initiation.
- Temporarily disable text selection only inside the outline during bullet dragging; restore it on release, cancellation, drag end or window blur.
- Preserve ordinary text selection and modified selection gestures.

## 1.1.1

- Preserve native up/down movement within multiline blocks; switch siblings only at the first or last visual line.
- Enter the previous sibling at its end and the next sibling at its start.
- Restyle floating actions as a compact borderless tab attached to the card, with matching paper background and quieter icons.

## 1.1.0

- Dim the Page title label and title text consistently without multiplying nested editor opacity.

- Use continuous branch surfaces with a unified rounded outer contour and flush internal joins.
- Highlight only the current block and its descendants using the same theme-derived paper color as the floating toolbar; dim other branches.
- Fill the workspace below the toolbar while preserving content breathing room.
- Add optional fine paper fibers confined to the highlighted silhouette; leave inactive areas plain.
- Support independent column scrolling and keep manual horizontal browsing stable.
- Limit default column width and prevent native caret reveal from undoing horizontal centering.
- Preserve native editing and boundary-based parent/child navigation, with guards for selections, composition, modifiers and held-arrow repeats.
- Keep up/down navigation within the same parent and retain immediate focus for newly created blocks.
- Add layout, outline, texture-scope and keyboard regression checks.

## 1.0.3

- Center the page-title column when clicked or focused; resume automatic focus after manual browsing and keep centering on resize.
- Cancel follow-up graph writes when the view exits or the plugin unloads; clean up timers, listeners and download URLs.
- Let Roam save its own editor text before creating an Enter sibling; avoid writing stale editor snapshots back to existing blocks.
- Add layout, mutation-cancellation and lifecycle regression tests.
- Add before/after screenshots near the top of the README and simplify section numbering.

## 1.0.2

- Rename the plugin, README, icon labels, settings dialog and commands to Gingko Writing.
- Keep the installation directory named `Gingko-Writing` for in-place updates.

## 1.0.1

- Hide native `rm-multibar` hierarchy guides only in transformed columns, keeping bullets and card outlines.
- Give title decoration suppression higher specificity than the observed theme kicker rule; retain native title editing and restore theme styling on exit.
- Use the stable `Gingko-Writing` folder name for all releases.

## 1.0.0

- Package the established Gingko-style view as a Roam extension with serialized loading and unloading.
- Keep only Toggle and Settings commands; support user-defined shortcuts.
- Lower inactive-block opacity to 2%, with a new-install default of 18%.
- Use a softer theme-derived current-block tint; add a 0–12% tint control.
- Normalize the native editable page-title card and suppress theme decorations while active.
- Retain sibling horizontal stability, parent/child boundary navigation, Enter/Tab handling, branch highlighting, bullet dragging, Markdown export, Zen integration and manual scrolling behavior.
- Store plugin preferences through the extension settings API when permitted; retain a standalone script fallback.
- Add categorized documentation and acknowledge Gingko Writer and Obsidian Lineage.
