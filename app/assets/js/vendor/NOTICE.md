# Vendored Browser Dependencies

These files are vendored so Official DOCX Export can run offline without CDN access or a build step.

| File | Package | Version | License | Source |
| --- | --- | --- | --- | --- |
| `docxtemplater.min.js` | `docxtemplater` | 3.69.0 | MIT | `https://unpkg.com/docxtemplater@3.69.0/build/docxtemplater.min.js` |
| `pizzip.min.js` | `pizzip` | 3.2.0 | MIT or GPL-3.0; used under MIT-compatible option | `https://unpkg.com/pizzip@3.2.0/dist/pizzip.min.js` |
| bundled in `pizzip.min.js` | `pako` | 2.1.0 | MIT and Zlib | `pizzip.min.js.LICENSE.txt` |

License files are stored beside the vendored scripts:

- `docxtemplater.LICENSE.md`
- `pizzip.LICENSE.markdown`
- `pizzip.min.js.LICENSE.txt`

Package metadata snapshots are stored for review:

- `docxtemplater.package.json`
- `pizzip.package.json`
