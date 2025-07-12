-- Insert sample users
INSERT INTO users (id, email, name, location, bio, skills_offered, skills_wanted, rating, completed_swaps) VALUES
('user1', 'alice@example.com', 'Alice Johnson', 'San Francisco, CA', 'Passionate developer and designer with 5+ years of experience.', ARRAY['React', 'JavaScript', 'UI/UX Design'], ARRAY['Python', 'Machine Learning'], 4.8, 12),
('user2', 'bob@example.com', 'Bob Smith', 'New York, NY', 'Data scientist and Python enthusiast. Love teaching ML concepts.', ARRAY['Python', 'Data Science', 'Machine Learning'], ARRAY['React', 'Frontend Development'], 4.9, 8),
('user3', 'carol@example.com', 'Carol Davis', 'Austin, TX', 'Creative professional specializing in visual content creation.', ARRAY['Photography', 'Video Editing', 'Graphic Design'], ARRAY['Web Development', 'SEO'], 4.7, 15),
('user4', 'david@example.com', 'David Wilson', 'Seattle, WA', 'Musician and audio engineer with 10+ years of experience.', ARRAY['Guitar', 'Music Production', 'Audio Engineering'], ARRAY['Marketing', 'Social Media'], 4.6, 6),
('user5', 'emma@example.com', 'Emma Brown', 'Los Angeles, CA', 'Full-stack developer and photography hobbyist.', ARRAY['Node.js', 'Photography', 'Database Design'], ARRAY['Mobile Development', 'DevOps'], 4.9, 20);

-- Insert sample swap requests
INSERT INTO swap_requests (id, from_user_id, to_user_id, skill_wanted, message, status) VALUES
('req1', 'user2', 'user1', 'React', 'Hi! I would love to learn React from you. I can teach you Python and ML in return.', 'pending'),
('req2', 'user3', 'user1', 'JavaScript', 'Would love to exchange photography skills for JavaScript knowledge!', 'pending'),
('req3', 'user1', 'user4', 'Guitar', 'Hi! I would love to learn guitar from you. I can teach web development in return.', 'accepted'),
('req4', 'user5', 'user2', 'Machine Learning', 'Interested in learning ML techniques. Can offer Node.js expertise.', 'completed');

-- Insert sample feedback
INSERT INTO feedback (id, swap_request_id, from_user_id, to_user_id, rating, comment) VALUES
('fb1', 'req4', 'user5', 'user2', 5, 'Amazing teacher! Very patient and knowledgeable about ML concepts.'),
('fb2', 'req4', 'user2', 'user5', 5, 'Great experience! Emma taught me Node.js fundamentals very clearly.');

-- Insert sample reports
INSERT INTO reports (id, reporter_id, reported_user_id, reason, description, status) VALUES
('rep1', 'user1', 'user3', 'Inappropriate behavior', 'User was sending inappropriate messages during skill exchange sessions.', 'pending'),
('rep2', 'user2', 'user4', 'Spam', 'User is sending spam messages to multiple people.', 'resolved');

-- Insert sample admin actions
INSERT INTO admin_actions (id, admin_id, action_type, target_id, details) VALUES
('admin1', 'user1', 'approve_report', 'rep2', 'Report approved and user warned'),
('admin2', 'user1', 'send_notification', NULL, 'Platform maintenance scheduled for this weekend');
