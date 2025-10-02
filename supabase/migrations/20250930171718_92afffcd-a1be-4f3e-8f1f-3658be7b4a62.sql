-- Remove unique constraint that prevents tracking multiple sessions of same meditation
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_meditation_id_key;

-- Insert dummy progress data for dev@peacefulkids.app user
INSERT INTO user_progress (user_id, meditation_id, progress_seconds, is_completed, completed_at)
VALUES
  -- Today
  ('35366558-654c-4908-b08e-6828a66719d3', '3d535673-39fb-4775-80d0-892adf3417b2', 600, true, NOW()),
  ('35366558-654c-4908-b08e-6828a66719d3', '0af3c0d0-01d9-48b6-9119-c3e33dcec29b', 900, true, NOW() - INTERVAL '2 hours'),
  
  -- Yesterday
  ('35366558-654c-4908-b08e-6828a66719d3', 'fde6979e-c7d4-496d-995d-6e20ade1b5d9', 720, true, NOW() - INTERVAL '1 day'),
  ('35366558-654c-4908-b08e-6828a66719d3', '0a4e36f9-ba62-472d-ba52-a9f4224db257', 480, true, NOW() - INTERVAL '1 day' - INTERVAL '3 hours'),
  
  -- 2 days ago
  ('35366558-654c-4908-b08e-6828a66719d3', '0448e1e1-a4fe-4c24-96b9-ea8cfcb585f3', 1200, true, NOW() - INTERVAL '2 days'),
  
  -- 3 days ago
  ('35366558-654c-4908-b08e-6828a66719d3', '3d535673-39fb-4775-80d0-892adf3417b2', 660, true, NOW() - INTERVAL '3 days'),
  ('35366558-654c-4908-b08e-6828a66719d3', '0af3c0d0-01d9-48b6-9119-c3e33dcec29b', 540, true, NOW() - INTERVAL '3 days' - INTERVAL '4 hours'),
  
  -- 4 days ago
  ('35366558-654c-4908-b08e-6828a66719d3', 'fde6979e-c7d4-496d-995d-6e20ade1b5d9', 900, true, NOW() - INTERVAL '4 days'),
  
  -- 6 days ago
  ('35366558-654c-4908-b08e-6828a66719d3', '0a4e36f9-ba62-472d-ba52-a9f4224db257', 780, true, NOW() - INTERVAL '6 days'),
  
  -- 8 days ago
  ('35366558-654c-4908-b08e-6828a66719d3', '0448e1e1-a4fe-4c24-96b9-ea8cfcb585f3', 600, true, NOW() - INTERVAL '8 days');