# eartharoid:go

Originally made in January 2021, as a serverless replacement for YOURLS, with Vercel & Firebase/Firestore.
The UI never really worked properly due to Vercel's caching, and became quite slow with all the unnecessary click data in the database. 

![January 2021 - May 2022 stats](https://static.eartharoid.me/k/22/05/09223553.png)

To view the code and read more about the original version, switch to the [v1 branch](https://github.com/eartharoid/go/tree/v1).

## How it works

It uses Cloudflare Workers, and URLs are stored in KV. This is my first Cloudflare Workers & KV project. There's no UI or even an API for managing URLs currently (because I rarely need to shorten a URL quickly), so links must be added either via the Cloudflare Dashboard, or the wrangler CLI.

It uses [umami](https://umami.is) for privacy-friendly analytics/stats.

### Routes

- `/:id.png` -> Generate a QR code
- `/:id+` -> Redirect to umami
- `/:id~` -> Show the link preview page
- `/:id` -> Redirect to long URL
- `/*` -> Redirect to `eartharoid.me`