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
- Fully deepened lessons across all ten modules, including foundations, execution, memory, loading, Windows management, security, synchronisation, IPC, hooking, and injection analysis.
- Windows-specific explanations, API connections, and primary documentation for every lesson.
- Interactive knowledge checks and guided investigations throughout the curriculum.
- Integrated investigation workspaces inside the lessons, plus downloadable starter files where a runnable artifact is useful.
- Purpose-first pywin32 module guide with 386 searchable wrapper, constant, structure, and native-companion entries.
- Windows API guide with 135 callable variants grouped into 106 represented-operation families, including the process, thread, handle, synchronization, pipe, service, security, heap, file, and Registry APIs named by the supplied course materials.
- A course-source coverage manifest and regression test mapping 58 explicit pywin32 references and 92 native API references from the supplied decks, notes, textbook documents, and exercise files to visible guide content.
- Sysinternals toolbox integrated with the curriculum.
- Search across lessons, their concepts and APIs, pywin32 modules, and tools.
- Static architecture suitable for GitHub Pages.
- A repeatable course audit covering all lesson structures, downloads, reference entries, API signatures, Windows API translations, source links, and prohibited punctuation.

See [PLAN.md](PLAN.md) for the full curriculum and product direction.

## Release validation

Run the complete local gate from the repository root with `node scripts/release-gate.mjs`. It checks JavaScript syntax, the structural course audit, every sorted `test-*.mjs` suite, and all 41 Python downloads without importing them. Headless browser suites require Microsoft Edge, Chrome, or Chromium; Windows runtime checks use 64-bit CPython with matching pywin32.

`node scripts/prepare-pages-artifact.mjs` builds a clean `_site/` containing only the index, its local CSS/JavaScript, `.nojekyll`, and `downloads/**`. `node scripts/verify-pages-assets.mjs --url <pages-url>` retries transient responses and compares every public byte with that artifact.

The runtime runner is read-only by default. Use `node scripts/run-runtime-validation.mjs --check-environment --python <absolute-python>` before an explicit `--profile automated-safe`. Service mutation, token work, multi-terminal exercises, optional Registry writes, and Sysinternals checkpoints remain operator-controlled under [the Stage 8 protocol](docs/stage-8-runtime-validation.md).

GitHub Actions validates pull requests on Ubuntu and Windows without Pages write permission. Validated `main` or manual runs build `_site`, deploy that exact artifact, and verify the returned Pages URL byte-for-byte before the workflow succeeds.
