# CRAVE Review System

> New capability: backend `reviews` table exists (001) but no full flow. Requires additive migration.

## 1. Rules

- Eligibility: only `PICKED_UP` orders, one review per `(user, order)` (existing UNIQUE), food+outlet rated together, window 30d. **Server-enforced** in RPC — client hints only.
- States: `pending → published | hidden | reported → moderated`. Auto-publish unless reported; moderation queue for management.
- Aggregates: **never client-averaged**. `recalc_outlet_rating()` + `recalc_food_rating()` triggers maintain `rating, total_reviews` + `rating_distribution {5..1}`. Distribution shown as bars.
- Photos: `review-images` public bucket, max 3, 5MB, WebP. Helpful votes: `review_helpful_votes(user, review UNIQUE)`; reports: `review_reports(reason, details)`; vendor replies: `review_replies(vendor_id, body, 1 per review, editable 24h)`.
- Sorting: helpful · newest · highest · lowest. Filters: with-photos, verified-only, rating. Display: user, date, stars, comment, photos, verified-purchase badge, helpful count, vendor reply.

## 2. Schema (additive, migration 019)

`review_images, review_helpful_votes, review_reports, review_replies` + `reviews.status + helpful_count + reports_count` + triggers + RLS (owner insert/update-own-pending, public read published, vendor reply own outlet, admin moderate). Backfill: existing rows → `published`.

## 3. UX

Write flow: star input (keyboard arrows) → comment (280 chars, counter) → photos → submit (RHF+Zod, preserve input on error, focus first invalid). Edit own pending within 24h. Report (reason select). Empty: "Be the first person to say what you really think."
