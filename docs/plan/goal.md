# FromYourLens Web App MVP

client proposal - https://www.upwork.com/nx/proposals/1924517505451651073

frontend dev link - https://rosebud.ai/edit/d5f93937-655d-4c0b-9844-8bd796415032

## 1. Authentication & Onboarding
- OAuth Sign-In: Users log in with their Google account (OWASP-compliant).

- Landing Screen: After login, two primary actions are presented:
  - "Import My Photos" (connect to Google Drive)
  - "Request Photos from a Friend" (generate & share referral link)

## 2. "Import My Photos" Flow
- Connect to Google Drive
- Fetch Photo Metadata (via stub/sample data for MVP)
- Auto-Scan for User's Face
  - Run face-api.js on each image.
  - Flag any photo where the user's face is detected.
- Manual Review Board
  - Display all "face-matched" photos in a grid.
  - Allow the user to deselect any false positives.
  - Confirm selection and upload to gallery.

## 3. "Request Photos from a Friend" Flow
- Generate Referral Link
  - User copies/link-shares it via text, email, etc.
- Friend Clicks Link → Onboarding
  - Friend goes through the same OAuth & Google Drive connect steps.
- Auto-Scan for Original User's Face
  - Instead of matching the friend's face, detect the referrer's face.
- Manual Review Board (Friend's View)
  - Friend deselects any incorrect matches.
  - On confirmation, images are uploaded into the original user's gallery.
