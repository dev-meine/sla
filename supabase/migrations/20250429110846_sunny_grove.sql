/*
  # Initial Schema Setup

  1. New Tables
    - `athletes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `image_url` (text)
      - `sport` (text)
      - `specialties` (text[])
      - `records` (text[])
      - `achievements` (text[])
      - `bio` (text)
      - `nationality` (text)
      - `date_of_birth` (date)
      - `club` (text)
      - `coach` (text)
      - `training_base` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `board_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `position` (text)
      - `image_url` (text)
      - `bio` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `activities`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `category` (text)
      - `date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `news_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `image_url` (text)
      - `author` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gallery_items`
      - `id` (uuid, primary key)
      - `type` (text)
      - `url` (text)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Athletes table
CREATE TABLE athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  sport text NOT NULL,
  specialties text[],
  records text[],
  achievements text[],
  bio text,
  nationality text,
  date_of_birth date,
  club text,
  coach text,
  training_base text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Board members table
CREATE TABLE board_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  image_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News posts table
CREATE TABLE news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  author text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gallery items table
CREATE TABLE gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  url text NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to athletes"
  ON athletes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to board_members"
  ON board_members FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to activities"
  ON activities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to news_posts"
  ON news_posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to gallery_items"
  ON gallery_items FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Allow authenticated users to manage athletes"
  ON athletes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage board_members"
  ON board_members FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage activities"
  ON activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage news_posts"
  ON news_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage gallery_items"
  ON gallery_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);