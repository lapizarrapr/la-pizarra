-- Runs once, when the local Postgres volume is first created.
-- Separate database so automated tests never touch development content.
CREATE DATABASE lapizarra_test OWNER lapizarra;
