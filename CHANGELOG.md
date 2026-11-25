# Changelog

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
