\echo 'Delete and recreate easytrips db?'
\prompt 'Return for yes or control-C to cancel >'

DROP DATABASE easytrips;
CREATE DATABASE easytrips;
\connect easytrips

\i easytrips-schema.sql
-- \i easytrip-seed.sql
