-- Expand Chinhoyi launch locations with additional suburbs
INSERT INTO public.locations (country, province, city, suburb) VALUES
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Alaska'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Avelon'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Caves Area'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Cherima'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Chikonohono'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Chitambo'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Gadzema'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Gunhill'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Katanda'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Mapako'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Mupfure'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Mzari'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Rusununguko'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Shackleton'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Sinoia Hill'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'St Ives 1'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'St Ives 2'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Whitecity'),
  ('Zimbabwe', 'Mashonaland West', 'Chinhoyi', 'Zvimba Park')
ON CONFLICT DO NOTHING;
