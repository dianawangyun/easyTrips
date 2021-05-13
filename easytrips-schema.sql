CREATE TABLE users
(
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL CHECK (position('@' IN email)>1)
);

CREATE TABLE trips
(
    trip_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users ON DELETE CASCADE,
    trip_name VARCHAR(300) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE Activities
(
    activity_id VARCHAR(50) PRIMARY KEY,
    trip_id VARCHAR(50) NOT NULL REFERENCES trips ON DELETE CASCADE,
    activity_name VARCHAR(300) NOT NULL,
    description VARCHAR(300),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location VARCHAR(300),
    latitude NUMERIC,
    longitude NUMERIC,
    comment TEXT
);