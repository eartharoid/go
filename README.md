# eartharoid-go

A serverless URL shortener.

Uses Firestore (was going to use FaunaDB but I didn't understand the docs) for storage and Vercel serverless functions.

## API endpoints

- POST `/api/create`
- GET `/api/get`
- GET `/api/list`
- GET `/api/redirect`
