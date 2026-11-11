# Steady

A daily health tracker for phone or browser. Track medications and supplements (including fortnightly doses and dose cycles), hydration, retainers, training, extras like sauna and red light, weight and your period. Log pain, fatigue, flares, travel and gluten, then look for patterns in Insights.

## Files

- `steady.html`: the app source. This is also the version published as a Claude artifact.
- `docs/index.html`: the GitHub Pages build. Don't edit it by hand. Run `sh build.sh` after changing `steady.html`.

## Where your data is stored

- **Claude artifact version:** entries sync privately across your devices.
- **GitHub Pages version:** entries stay only in the browser you use (localStorage). Clearing site data deletes them, so use My plan, then "Export backup" now and then.
