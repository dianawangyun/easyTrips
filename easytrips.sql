\echo 'Delete and recreate easytrips db?'
\prompt 'Return for yes or control-C to cancel >'

DROP DATABASE easytrips_test;
CREATE DATABASE easytrips_test;
\connect easytrips_test

\i easytrips-schema.sql
-- \i easytrip-seed.sql
