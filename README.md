# ILOVEOS

A dependency-free, dark-mode learning site for the Operating Systems material in this repository.

## Preview locally

The site uses plain HTML, CSS, and JavaScript, so it can be opened directly through `index.html`. For behaviour closest to GitHub Pages, serve this directory with any static file server.

For example, from the `ILOVEOS` directory:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Current implementation

- Responsive course homepage and ordered module list.
- Overview page for every module.
- All 62 lessons across the ten modules, in a complete reading order.
- Windows-specific explanations, API connections, and primary documentation for every lesson.
- Interactive knowledge checks and guided investigations throughout the curriculum.
- Downloadable Markdown worksheets for every investigation, plus lesson-specific starter files where available.
- Purpose-first pywin32 module guide with filtering.
- Sysinternals toolbox integrated with the curriculum.
- Search across lessons, their concepts and APIs, pywin32 modules, and tools.
- Static architecture suitable for GitHub Pages.

See [PLAN.md](PLAN.md) for the full curriculum and product direction.
