INSERT INTO destinations (name, location)
VALUES
  ('Paris', 'Paris, France'),
  ('Rome', 'Rome, Italy'),
  ('Barcelona', 'Barcelona, Spain'),
  ('Vienna', 'Vienna, Austria'),
  ('Prague', 'Prague, Czechia')
ON CONFLICT (name, location) DO NOTHING;
