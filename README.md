# WHV 88-Day Calculator

This repository hosts a simple web app that helps Working Holiday Visa (WHV) holders track the
"specified work" required for visa extensions. The calculator lets you enter your
work weeks, validates that the job type and postcode are eligible, and shows how
many days count towards the 88‑day requirement.

## Opening `index.html`

No build step is necessary. Clone the repository and open `index.html` in any
modern browser:

```bash
# from the project root
open index.html     # macOS
# or
xdg-open index.html # Linux
```

## Customising job types or postcodes

The lists of allowed job types and postcodes are defined in `script.js`:

- `JOB_TYPES` – official English names
- `JOB_TYPES_FR` – French labels shown in the dropdown
- `ELIGIBLE_POSTCODES` – all postcodes where specified work is recognised
- `NA_POSTCODES` – the subset where tourism/hospitality is valid

Edit these arrays to add or remove entries. The feedback messages can also be
translated by modifying the `FEEDBACK` object in the same file.

Contributions are welcome through pull requests if you can help maintain the
lists or provide additional translations.

## Node / npm

Running the calculator only requires a browser. Future improvements may rely on
Node based tooling (for example to bundle scripts or manage translations). If
you plan to work on those enhancements, install Node.js (v16 or newer) and npm
on your machine.
