-- Update publish dates for Glasgow 2026 Commonwealth Games news posts
UPDATE public.news_posts 
SET created_at = '2026-08-06 12:00:00+00', updated_at = NOW() 
WHERE title ILIKE '%Sierra Leone Young Swimmer Shines on Commonwealth Debut%';

UPDATE public.news_posts 
SET created_at = '2026-07-25 12:00:00+00', updated_at = NOW() 
WHERE title ILIKE '%Minister of Sports, NSA Boss and NOC President Address Team Sierra Leone%';
