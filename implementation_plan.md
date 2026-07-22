# Goal: Make static home page reviews visible in Admin Portal and ensure new customer reviews appear

## User Review Required
> [!IMPORTANT]
> The admin panel currently only shows reviews stored in the `product_reviews` table. The three hard‑coded reviews on the Home page are not in the database, so they never appear in the admin UI. Additionally, a newly submitted review is not showing, likely because the `productId` used does not match an existing product.

## Open Questions
> [!WARNING]
> - Do you want the static reviews to be linked to specific product IDs (e.g., the most popular products) or stored with a generic placeholder?
> - Should we automatically delete these placeholder reviews after real ones exist, or keep them until manually removed?

## Proposed Changes
---
### Migration Script
- **[NEW]** `src/scripts/migrate_static_reviews.ts`
  - Inserts the three static reviews into `product_reviews` using the Supabase client.
  - Assigns each review a realistic `productId` (e.g., the first three featured products) or uses a sentinel value `static_home` if you prefer.
  - Sets `createdAt` and `repliedAt` to `new Date().toISOString()`.
  - Marks them with a flag `isStatic: true` (add column if needed) so they can be identified later.

---
### Database Schema Update (if needed)
- **[MODIFY]** `supabase_schema.sql`
  - Add optional boolean column `is_static` to `product_reviews` (default `false`).
  - Run migration to add column.

---
### Admin Panel Adjustments
- No code changes required – `AdminPortal.tsx` already loads all reviews via `getAllReviews()`.
- Ensure the UI shows `isStatic` flag (optional) for clarity.

---
### Submit Review Fix
- Verify `submitProductReview` in `src/services/database.ts` correctly stores `productId`.
- If the missing review used a wrong product ID, add a guard that logs a warning when `productId` does not exist in `products` table.
- **[MODIFY]** `src/services/database.ts`
  - After inserting, fetch product to confirm existence; if missing, return an error.

---
### Verification Plan
- Run the migration script locally.
- Reload Admin Portal – the three reviews should now appear.
- Submit a new review for a known product and confirm it appears in Admin Portal.
- Check Supabase `product_reviews` table to verify records.

### Automated Tests (manual)
1. Execute `npm run dev` and open `/admin` – count of reviews should increase by 3.
2. Use the "Write Review" flow on a product page, submit, then verify entry appears under Reviews tab.

---
## Verification Plan
### Manual Verification
- Open the admin page after migration and confirm the three placeholder reviews are listed.
- Submit a fresh review for a product and confirm it appears immediately.

### Optional Automated Tests
- Add a simple Jest test that calls `databaseService.getAllReviews()` and expects at least 3 records after migration.
