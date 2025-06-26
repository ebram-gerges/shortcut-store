-- MySQL Database Setup for Shortcut Store
-- Run this script as MySQL root user

-- Create database
CREATE DATABASE IF NOT EXISTS shortcut_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER IF NOT EXISTS 'shortcut_user'@'%' IDENTIFIED BY 'your_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON shortcut_store.* TO 'shortcut_user'@'%';

-- Grant privileges for creating databases (if needed for migrations)
GRANT CREATE ON *.* TO 'shortcut_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show the created database
SHOW DATABASES LIKE 'shortcut_store';

-- Show the created user
SELECT User, Host FROM mysql.user WHERE User = 'shortcut_user'; 