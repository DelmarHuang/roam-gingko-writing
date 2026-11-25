# Folio compatibility audit

Source: DelmarHuang/roam-folio extension.js, retrieved 2026-11-25. This inventory covers every registered theme group and independent feature in that source. It is a source-level integration review, not a claim that every feature has been exercised in a live graph.

## Boundaries

- Gingko controls geometry only for nodes marked as its outline boxes, rows and pass-through wrappers. Embedded widget internals are excluded from the column engine.
- Card content width safeguards operate with any theme. Folio settings and data attributes are never rewritten.
- Property-card decoration is suppressed while active, and its hidden corner click target is guarded. Actual text, tags, references and native controls remain.
- Settings, menus, calendars, sidebars, Desk and portal surfaces outside the active outline are not globally restyled or disabled.

## Inventory

| Group | Source review and treatment |
|---|---|
| web-fonts | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| base | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| layout | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| menus | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| references | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| quotes | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| callouts | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| tasks | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| left-sidebar | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| block-controls | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| topbar | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| page-titles | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| headings | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| inline | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| links | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| code-style | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| tables | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| responsive | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| kanban | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| diagram | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| slider | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| settings | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| marketplace | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| misc | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| theme-host-fixes | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| sidebar-toggles | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| hide-top-buttons | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| hide-left-sidebar-items | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| workbench-compat | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| scroll-indicator | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| tags | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| or-dropdown | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| daily-masthead | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| typewriter | Folio scroll behavior is not disabled. Combined-mode runtime interaction still needs testing. |
| calendar-quick | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| calendar-keyboard | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| calendar-template | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| asides | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| code-height | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| images | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| graph-button | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| right-sidebar | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| pdf | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| property-card | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| calendar-preview | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| calendar-carry | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| page-stats | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| weight | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| code-tools | Content bounded to the card; wide widget scroll regions retained. Internal feature behavior remains Folio-owned. |
| video-reader | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| calendar-capture | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| pulse | Gingko owns marked-node geometry and focus surfaces; Folio typography and semantic content remain. |
| editorial-desk | Preserved; no global override. UI outside the marked outline remains Folio-owned. |
| random-tasks | Preserved; no global override. UI outside the marked outline remains Folio-owned. |

## Validation

- Live page inspection confirmed native full-width negative margins and a 500px minimum table footer; Folio-off reproduction was also measured.
- The property-card pseudo-element and hidden hit-zone mechanisms were confirmed in Folio source and matched the supplied screenshot.
- Automated checks cover layout, navigation, drag, lifecycle cleanup, theme detection, widget scrolling and property event guards.
- The 1.1.9 visual result, feature-by-feature interaction coverage and macOS native fullscreen behavior have not been verified in the desktop app.
