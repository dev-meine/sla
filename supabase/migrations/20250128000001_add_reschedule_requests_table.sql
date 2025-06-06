-- Create reschedule_requests table
CREATE TABLE reschedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES swimming_registrations(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reschedule_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reschedule requests"
  ON reschedule_requests FOR SELECT
  USING (true);

CREATE POLICY "Users can create reschedule requests"
  ON reschedule_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all reschedule requests"
  ON reschedule_requests FOR ALL
  USING (true);

-- Create index for better performance
CREATE INDEX idx_reschedule_requests_registration_id ON reschedule_requests(registration_id);
CREATE INDEX idx_reschedule_requests_status ON reschedule_requests(status);