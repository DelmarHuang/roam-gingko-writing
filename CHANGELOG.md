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
