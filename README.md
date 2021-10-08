# eartharoid-go

A serverless URL shortener, made with Vercel and Firestore (I was going to use FaunaDB but it was too complicated 😦).

## Why I made it

YOURLS is good, but:

1. It's PHP (ew)
2. It requires a server (mostly this)
3. It's ugly (although less with Sleeky)

This is a serverless, and most importantly, free (to operate) alternative that looks better. Includes a basic admin dashboard, link preview pages (append `~`), and link stats pages (append `+`).

## Screenshots

See the [**Imgur album**](https://imgur.com/a/ZR0YXMg) for screenshots of the different pages.

[![Imgur album](https://i.imgur.com/jJf6syj.png)](https://imgur.com/a/ZR0YXMg)

## Instructions

You need to create a [Google Cloud IAM service account](https://console.cloud.google.com/iam-admin/serviceaccounts), download the JSON key, minify the json, and set it as a variable called `FIREBASE` in Vercel. Create a Google API key for Google Maps under the same cloud project. Go to the [Firebase console](https://console.firebase.google.com/), setup Firestore, and add two collections: `urls` and `clickers`. You can set the ``ADMIN_PASSWORD`` variable to lock the dashboard and creation of URLs.

An IPData.co API key is also required for stats. This doesn't track users, but it does store the location each redirect request came from.
