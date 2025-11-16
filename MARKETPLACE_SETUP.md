# Strategies Marketplace Setup Guide

This guide will help you set up the Strategies Marketplace feature for NeuroStrat.

## Prerequisites

- Supabase project configured
- Next.js app running
- User authentication working

## Database Setup

### 1. Run Migrations

Execute the following migration files in order in your Supabase SQL Editor:

1. `supabase/migrations/005_create_marketplace_tables.sql` - Creates marketplace tables
2. `supabase/migrations/006_seed_marketplace_data.sql` - Optional seed data

### 2. Create Storage Bucket

The marketplace requires a Supabase Storage bucket for strategy files:

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **New bucket**
4. Name: `strategy-files`
5. Make it **Public** (or configure RLS policies as needed)
6. Click **Create bucket**

### 3. Configure Storage Policies (Optional)

If you want to keep the bucket private, add RLS policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload strategy files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'strategy-files');

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'strategy-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public to read published strategy files
CREATE POLICY "Public can read published strategy files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'strategy-files');
```

## Features

### Marketplace Pages

- **`/marketplace`** - Main marketplace page with:
  - Grid layout of strategies
  - Search functionality
  - Advanced filters (pair, timeframe, type, winrate, complexity)
  - Statistics dashboard
  - Upload strategy button

- **`/marketplace/[id]`** - Strategy detail page with:
  - Full strategy information
  - Author profile
  - Reviews and ratings
  - Purchase/download functionality
  - Preview for non-buyers

### API Routes

- `GET /api/marketplace` - List all published strategies (with filters)
- `POST /api/marketplace` - Upload a new strategy
- `GET /api/marketplace/[id]` - Get strategy details
- `PUT /api/marketplace/[id]` - Update strategy
- `DELETE /api/marketplace/[id]` - Delete strategy
- `POST /api/marketplace/[id]/purchase` - Purchase a strategy
- `GET /api/marketplace/[id]/reviews` - Get reviews
- `POST /api/marketplace/[id]/reviews` - Create/update review
- `DELETE /api/marketplace/[id]/reviews` - Delete review

### Database Tables

1. **strategies_marketplace** - Main strategies table
2. **strategy_reviews** - User reviews and ratings
3. **payment_logs** - Payment tracking (for future Stripe integration)
4. **user_purchases** - Tracks which users purchased which strategies

## Usage

### Uploading a Strategy

1. Navigate to `/marketplace`
2. Click **Upload Strategy**
3. Fill in the form:
   - Title and description (required)
   - Upload a PDF or text file (optional)
   - Set price (0 for free)
   - Add metadata (pair, timeframe, type, etc.)
   - Add preview text for non-buyers
   - Choose publish/private options
4. Click **Upload Strategy**

### Purchasing a Strategy

1. Browse strategies on `/marketplace`
2. Click on a strategy to view details
3. Click **Purchase** (or **Get Free Strategy** for free ones)
4. After purchase, download button appears

### Reviewing Strategies

1. Purchase a strategy first
2. Navigate to strategy detail page
3. Scroll to reviews section
4. Rate (1-5 stars) and write a comment
5. Submit review

## Filtering Strategies

The marketplace supports filtering by:

- **Trading Pair**: EUR/USD, GBP/USD, BTC/USD, etc.
- **Timeframe**: 1m, 5m, 1h, 4h, 1d, 1w
- **Strategy Type**: Scalping, Intraday, Swing
- **Min Winrate**: Filter by minimum winrate percentage
- **Complexity**: Beginner, Intermediate, Advanced
- **Sort By**: Newest, Highest Rated, Price, Most Popular

## Future Enhancements

### Stripe Integration

The payment system is set up with placeholder logic. To integrate Stripe:

1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Add Stripe keys to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
   STRIPE_SECRET_KEY=your_key
   ```
3. Update `app/api/marketplace/[id]/purchase/route.ts` to:
   - Create Stripe Checkout Session
   - Handle webhook for payment confirmation
   - Update payment status based on webhook

### Additional Features

- Strategy categories
- Author profiles and portfolios
- Strategy performance tracking
- Wishlist functionality
- Strategy bundles
- Affiliate system

## Troubleshooting

### Storage Upload Errors

- Ensure the `strategy-files` bucket exists
- Check bucket permissions
- Verify RLS policies if bucket is private

### Purchase Not Working

- Check that user is authenticated
- Verify strategy is published and not private
- Check payment_logs table for errors

### Reviews Not Showing

- Ensure user has purchased the strategy
- Check that reviews are being inserted correctly
- Verify RLS policies allow reading reviews

## Seed Data

To populate the marketplace with example strategies:

1. Use the SQL migration file: `006_seed_marketplace_data.sql`
2. Or run the TypeScript script: `npx tsx scripts/seed-marketplace.ts`
3. Make sure to update user IDs/emails in the seed files

## Security Notes

- All routes are protected by authentication
- RLS policies ensure users can only:
  - View published, non-private strategies
  - Edit/delete their own strategies
  - Review strategies they've purchased
  - View their own purchases and payment logs

