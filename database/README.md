# Database Migrations

This folder contains SQL migrations for the Portugal Project database.

## How to Apply Migrations

### Method 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `001_create_gallery_table.sql`
5. Paste it into the SQL editor
6. Click **Run**

### Method 2: Using Supabase CLI

```bash
supabase db push
```

## Gallery Table Schema

The gallery table stores images with descriptions and tour associations.

### Fields:

- `id` (UUID): Primary key, auto-generated
- `image_url` (TEXT): URL of the gallery image
- `description` (TEXT): Optional description of the image
- `tour_id` (UUID): Foreign key reference to the tours table
- `tour_name` (VARCHAR): Name/tag of the tour or location
- `created_at` (TIMESTAMP): Auto-set creation timestamp
- `updated_at` (TIMESTAMP): Auto-set update timestamp

### Sample Data

To add sample gallery items, uncomment the INSERT statement at the bottom of `001_create_gallery_table.sql` and modify the URLs and tour information as needed.

## Security (RLS Policies)

The gallery table includes Row Level Security (RLS) policies:

- **Public Read**: Anyone can view gallery items
- **Authenticated Insert**: Only authenticated users can add items
- **Authenticated Update**: Only authenticated users can modify items
- **Authenticated Delete**: Only authenticated users can delete items

## Future Migrations

New migrations should be named sequentially:

- `002_add_liked_column.sql`
- `003_add_photographer_field.sql`
- etc.
