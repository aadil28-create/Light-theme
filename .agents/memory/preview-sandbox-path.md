---
name: Component preview URLs
description: The path convention required to render a component in the mockup sandbox preview server.
---

The mockup sandbox gallery root is only an index page. To render a component, use the generated preview route `/preview/<component-path>`, where the component path is relative to `src/components/mockups` and omits `.tsx`.

**Why:** The preview proxy can successfully serve the workflow while a screenshot of the gallery root looks blank or unrelated to the requested component.

**How to apply:** When verifying a mockup, target the artifact preview with a path such as `/preview/live-quiz/TemplateWorkspace`, then pass component state through its supported query parameters.