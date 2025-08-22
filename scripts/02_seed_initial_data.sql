-- Seed initial data for testing
-- Insert default admin user and sample data

-- Insert default admin user (password will be hashed in the application)
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator User', 'admin@example.com', '$2b$10$placeholder', '123 Admin Street, Admin City, AC 12345', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample store owners
INSERT INTO users (name, email, password, address, role) VALUES 
('John Store Owner Smith', 'john.store@example.com', '$2b$10$placeholder', '456 Store Avenue, Store City, SC 67890', 'store_owner'),
('Jane Store Owner Johnson', 'jane.store@example.com', '$2b$10$placeholder', '789 Business Boulevard, Business Town, BT 11111', 'store_owner')
ON CONFLICT (email) DO NOTHING;

-- Insert sample normal users
INSERT INTO users (name, email, password, address, role) VALUES 
('Alice Normal User Brown', 'alice.user@example.com', '$2b$10$placeholder', '321 User Lane, User Village, UV 22222', 'user'),
('Bob Normal User Wilson', 'bob.user@example.com', '$2b$10$placeholder', '654 Customer Court, Customer City, CC 33333', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert sample stores
INSERT INTO stores (name, email, address, owner_id) VALUES 
('Johns Amazing Electronics Store', 'contact@johnselectronics.com', '456 Store Avenue, Store City, SC 67890', 
 (SELECT id FROM users WHERE email = 'john.store@example.com')),
('Janes Wonderful Bookstore Shop', 'info@janesbookstore.com', '789 Business Boulevard, Business Town, BT 11111', 
 (SELECT id FROM users WHERE email = 'jane.store@example.com'))
ON CONFLICT (email) DO NOTHING;

-- Insert sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
((SELECT id FROM users WHERE email = 'alice.user@example.com'), 
 (SELECT id FROM stores WHERE email = 'contact@johnselectronics.com'), 4),
((SELECT id FROM users WHERE email = 'bob.user@example.com'), 
 (SELECT id FROM stores WHERE email = 'contact@johnselectronics.com'), 5),
((SELECT id FROM users WHERE email = 'alice.user@example.com'), 
 (SELECT id FROM stores WHERE email = 'info@janesbookstore.com'), 3)
ON CONFLICT (user_id, store_id) DO NOTHING;
