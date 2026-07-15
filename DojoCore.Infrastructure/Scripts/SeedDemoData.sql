-- =====================================================================================
-- DojoCore Demo/Seed Data Script
-- =====================================================================================
-- Populates the database with realistic randomized demo data:
--   1) 12 gyms, each with 1 manager, 2-4 coaches, 30-60 athletes, split into
--      groups of 6-12 athletes (one coach assigned per group)
--   2) 30 freelance athletes (role = Athlete, no gym affiliation)
--   3) 1 Demo Gym with 1 demo manager, 2 demo coaches, 40 demo athletes in 4 groups
--   4) 3 Super/Admin accounts: superuser, admin, webmaster
--   5) All members located in Europe, ~20% located in Greece
--   6) All members have full profile properties populated
--
-- PASSWORD (ALL seeded accounts, including demo accounts): Demo@12345
--
-- DEMO LOGIN CREDENTIALS (shown in the login page "Try Demo" popup):
--   Demo Manager            -> demo.manager    / Demo@12345
--   Demo Coach              -> demo.coach1     / Demo@12345
--   Demo Athlete            -> demo.athlete    / Demo@12345
--   Demo Freelance Athlete  -> demo.freelancer / Demo@12345
--
-- Roles:  0 = Admin | 1 = Coach | 2 = Manager | 3 = Athlete
-- Gender: 1 = Male   | 2 = Female
--
-- Requirements: PostgreSQL with the pgcrypto extension (enabled below).
-- Run this script once against the target database (e.g. via psql).
-- =====================================================================================

-- Make sure we target the correct schema regardless of the editor's default.
SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Everything below runs in a single explicit transaction so that data is persisted
-- even in SQL editors that use manual-commit mode. If any statement fails, the whole
-- batch is rolled back (check the messages tab for the first red error).
BEGIN;

-- ------------------------------------------------------------------------------------
-- Session-scoped helpers (auto-dropped when the connection closes)
-- ------------------------------------------------------------------------------------

DROP SEQUENCE IF EXISTS tmp_user_seq;
CREATE TEMP SEQUENCE tmp_user_seq START 1;

DROP TABLE IF EXISTS tmp_locations;
CREATE TEMP TABLE tmp_locations (
	country    text,
	city       text,
	lat        double precision,
	lon        double precision,
	is_greece  boolean
);

INSERT INTO tmp_locations (country, city, lat, lon, is_greece) VALUES
	('Italy',       'Rome',        41.90, 12.50, false),
	('Italy',       'Milan',       45.46, 9.19,  false),
	('Germany',     'Berlin',      52.52, 13.40, false),
	('Germany',     'Munich',      48.14, 11.58, false),
	('France',      'Paris',       48.85, 2.35,  false),
	('France',      'Lyon',        45.76, 4.84,  false),
	('Spain',       'Madrid',      40.42, -3.70, false),
	('Spain',       'Barcelona',   41.39, 2.17,  false),
	('Poland',      'Warsaw',      52.23, 21.01, false),
	('Netherlands', 'Amsterdam',   52.37, 4.90,  false),
	('Portugal',    'Lisbon',      38.72, -9.14, false),
	('Romania',     'Bucharest',   44.43, 26.10, false),
	('Sweden',      'Stockholm',   59.33, 18.07, false),
	('Austria',     'Vienna',      48.21, 16.37, false),
	('Belgium',     'Brussels',    50.85, 4.35,  false),
	('Czechia',     'Prague',      50.08, 14.43, false),
	('Denmark',     'Copenhagen',  55.68, 12.57, false),
	('Finland',     'Helsinki',    60.17, 24.94, false),
	('Hungary',     'Budapest',    47.50, 19.05, false),
	('Ireland',     'Dublin',      53.35, -6.26, false),
	('Norway',      'Oslo',        59.91, 10.75, false),
	('Croatia',     'Zagreb',      45.80, 15.98, false),
	('Bulgaria',    'Sofia',       42.70, 23.32, false),
	('Slovakia',    'Bratislava',  48.15, 17.11, false),
	('Greece',      'Athens',      37.98, 23.73, true),
	('Greece',      'Thessaloniki',40.64, 22.94, true),
	('Greece',      'Patras',      38.25, 21.73, true),
	('Greece',      'Heraklion',   35.34, 25.13, true),
	('Greece',      'Larissa',     39.64, 22.42, true);

CREATE OR REPLACE FUNCTION pg_temp.rand_int(min_val int, max_val int) RETURNS int AS $$
	SELECT min_val + floor(random() * (max_val - min_val + 1))::int;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION pg_temp.gen_code() RETURNS text AS $$
	SELECT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION pg_temp.pick_location() RETURNS TABLE(country text, city text, lat double precision, lon double precision) AS $$
DECLARE
	v_greece boolean := random() < 0.20; -- ~20% chance of Greece
BEGIN
	RETURN QUERY
		SELECT l.country, l.city, l.lat, l.lon
		FROM tmp_locations l
		WHERE l.is_greece = v_greece
		ORDER BY random()
		LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.random_first_name(p_gender smallint) RETURNS text AS $$
DECLARE
	male_names   text[] := ARRAY['Alexander','Nikos','Dimitris','Giorgos','Marco','Luca','Hans','Klaus',
								  'Pierre','Jean','Carlos','Miguel','Andrei','Ivan','Lukas','Tomas','Erik',
								  'Lars','Mateusz','Pawel','Stefan','Antonio','Giovanni','Wilhelm','Rasmus',
								  'Kostas','Yannis','Petros','Vassilis'];
	female_names text[] := ARRAY['Eleni','Maria','Sofia','Anna','Elena','Chiara','Giulia','Ingrid','Freya',
								  'Camille','Isabelle','Lucia','Carmen','Katarzyna','Agnieszka','Ioanna',
								  'Katerina','Nora','Elisabeth','Astrid','Despina','Aikaterini','Marina',
								  'Zoe','Athina'];
BEGIN
	IF p_gender = 1 THEN
		RETURN male_names[pg_temp.rand_int(1, array_length(male_names, 1))];
	ELSE
		RETURN female_names[pg_temp.rand_int(1, array_length(female_names, 1))];
	END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pg_temp.random_last_name() RETURNS text AS $$
DECLARE
	names text[] := ARRAY['Papadopoulos','Nikolaidis','Georgiou','Ioannou','Konstantinou','Rossi','Bianchi',
						   'Muller','Schmidt','Dubois','Bernard','Garcia','Fernandez','Ivanov','Petrov',
						   'Nowak','Kowalski','Andersen','Nielsen','Virtanen','Kovac','Novak','Popescu',
						   'Iliescu','Larsson','Berg','Costa','Silva','Moreau','Fischer'];
BEGIN
	RETURN names[pg_temp.rand_int(1, array_length(names, 1))];
END;
$$ LANGUAGE plpgsql;

-- Creates a fully-populated user row and returns its id.
CREATE OR REPLACE FUNCTION pg_temp.create_user(
	p_role smallint,
	p_username text,
	p_email text,
	p_first_name text,
	p_last_name text,
	p_gender smallint,
	p_min_age int,
	p_max_age int,
	p_country text,
	p_city text,
	p_lat double precision,
	p_lon double precision,
	p_description text
) RETURNS uuid AS $$
DECLARE
	v_id  uuid := gen_random_uuid();
	v_dob date;
BEGIN
	v_dob := (CURRENT_DATE
				- make_interval(years => pg_temp.rand_int(p_min_age, p_max_age))
				- make_interval(days  => pg_temp.rand_int(0, 364)))::date;

	INSERT INTO users (
		id, username, email, password_hash, user_code, role,
		first_name, last_name, profile_image, phone, description,
		address, gender, date_of_birth, latitude, longitude,
		status, created_at, updated_at
	) VALUES (
		v_id, p_username, p_email, crypt('Demo@12345', gen_salt('bf')), pg_temp.gen_code(), p_role,
		p_first_name, p_last_name, '/assets/images/users/default-avatar.png',
		'+' || pg_temp.rand_int(30, 420) || pg_temp.rand_int(1000000, 9999999)::text,
		p_description,
		pg_temp.rand_int(1, 199)::text || ' ' || p_city || ' Street, ' || p_country,
		p_gender, v_dob,
		p_lat + (random() - 0.5) * 0.2, p_lon + (random() - 0.5) * 0.2,
		0, now(), now()
	);

	RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- 0) Cleanup of previously seeded fixed accounts / demo gym (makes the script re-runnable)
--    Only removes the well-known fixed demo/admin accounts and the "Demo Dojo" gym and
--    everything attached to them. Randomly generated data from previous runs is left as-is.
-- =====================================================================================

DO $$
DECLARE
	v_gym_ids   uuid[];
	v_group_ids uuid[];
	v_user_ids  uuid[];
BEGIN
	-- Fixed, well-known accounts created by this script
	SELECT array_agg(id) INTO v_user_ids
	FROM users
	WHERE username IN ('superuser', 'admin', 'webmaster',
					   'demo.manager', 'demo.coach1', 'demo.coach2',
					   'demo.athlete', 'demo.freelancer');

	-- The demo gym and all users attached to it
	SELECT array_agg(id) INTO v_gym_ids FROM gyms WHERE gym_code = 'DEMOGYM1';

	IF v_gym_ids IS NOT NULL THEN
		SELECT array_agg(id) INTO v_group_ids FROM groups WHERE gym_id = ANY(v_gym_ids);

		IF v_group_ids IS NOT NULL THEN
			DELETE FROM group_athletes WHERE group_id = ANY(v_group_ids);
			DELETE FROM group_coaches  WHERE group_id = ANY(v_group_ids);
			DELETE FROM groups         WHERE id = ANY(v_group_ids);
		END IF;

		-- collect all members of the demo gym so they can be removed too
		v_user_ids := COALESCE(v_user_ids, ARRAY[]::uuid[])
					|| COALESCE((SELECT array_agg(user_id) FROM user_gym WHERE gym_id = ANY(v_gym_ids)), ARRAY[]::uuid[]);

		DELETE FROM user_gym WHERE gym_id = ANY(v_gym_ids);
		DELETE FROM gyms     WHERE id = ANY(v_gym_ids);
	END IF;

	IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
		DELETE FROM group_athletes WHERE user_id = ANY(v_user_ids);
		DELETE FROM group_coaches  WHERE user_id = ANY(v_user_ids);
		DELETE FROM user_gym       WHERE user_id = ANY(v_user_ids);
		DELETE FROM users          WHERE id = ANY(v_user_ids);
	END IF;
END $$;

-- =====================================================================================
-- 1) Super Users (Admin role): superuser, admin, webmaster
-- =====================================================================================

DO $$
DECLARE
	loc RECORD;
BEGIN
	SELECT * INTO loc FROM pg_temp.pick_location();
	PERFORM pg_temp.create_user(0::smallint, 'superuser', 'superuser@example.com', 'Super', 'User', 1, 30, 50,
		loc.country, loc.city, loc.lat, loc.lon, 'Platform super user with full administrative access.');

	SELECT * INTO loc FROM pg_temp.pick_location();
	PERFORM pg_temp.create_user(0::smallint, 'admin', 'admin@example.com', 'System', 'Admin', 1, 30, 50,
		loc.country, loc.city, loc.lat, loc.lon, 'Platform administrator account.');

	SELECT * INTO loc FROM pg_temp.pick_location();
	PERFORM pg_temp.create_user(0::smallint, 'webmaster', 'webmaster@example.com', 'Web', 'Master', 2, 30, 50,
		loc.country, loc.city, loc.lat, loc.lon, 'Webmaster account managing site content and configuration.');
END $$;

-- =====================================================================================
-- 2) 12 Gyms: 1 manager, 2-4 coaches, 30-60 athletes, groups of 6-12 athletes
-- =====================================================================================

DO $$
DECLARE
	gym_idx      int;
	gym_id       uuid;
	manager_id   uuid;
	coach_ids    uuid[];
	athlete_ids  uuid[];
	n_coaches    int;
	n_athletes   int;
	loc          RECORD;
	gender       smallint;
	fname        text;
	lname        text;
	uname        text;
	email        text;
	v_seq        bigint;
	i            int;
	j            int;
	group_id     uuid;
	group_size   int;
	start_idx    int;
	end_idx      int;
	coach_pick   uuid;
	gym_names    text[] := ARRAY['Spartan','Phoenix','Titan','Dragon','Eagle','Lion','Wolf','Falcon','Thunder','Iron','Golden','Silver'];
	gym_suffix   text[] := ARRAY['Martial Arts Academy','Combat Club','Judo Dojo','Karate Center','Taekwondo Academy','Fight Club','MMA Gym'];
BEGIN
	FOR gym_idx IN 1..12 LOOP
		SELECT * INTO loc FROM pg_temp.pick_location();

		-- Manager
		gender := pg_temp.rand_int(1, 2);
		fname := pg_temp.random_first_name(gender);
		lname := pg_temp.random_last_name();
		v_seq := nextval('tmp_user_seq');
		uname := 'manager' || v_seq || '.' || lower(lname);
		email := lower(fname) || '.' || lower(lname) || v_seq || '@example.com';

		manager_id := pg_temp.create_user(2::smallint, uname, email, fname, lname, gender, 30, 55,
			loc.country, loc.city, loc.lat, loc.lon,
			'Experienced gym manager overseeing daily operations in ' || loc.city || '.');

		gym_id := gen_random_uuid();
		INSERT INTO gyms (
			id, name, address, latitude, longitude, gym_code, created_by,
			logo_image, phone, contact_email, description, status, created_at, updated_at
		) VALUES (
			gym_id,
			loc.city || ' ' || gym_names[pg_temp.rand_int(1, array_length(gym_names, 1))] || ' ' ||
				gym_suffix[pg_temp.rand_int(1, array_length(gym_suffix, 1))],
			pg_temp.rand_int(1, 199)::text || ' ' || loc.city || ' Ave, ' || loc.country,
			loc.lat, loc.lon,
			pg_temp.gen_code(),
			manager_id,
			'/assets/images/gyms/default-logo.png',
			'+' || pg_temp.rand_int(30, 420) || pg_temp.rand_int(1000000, 9999999)::text,
			'contact@gym' || gym_idx || '.example.com',
			'A premier martial arts gym located in ' || loc.city || ', ' || loc.country || '.',
			0, now(), now()
		);

		INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
		VALUES (gen_random_uuid(), manager_id, gym_id, 2, 0, now());

		-- Coaches (2-4)
		coach_ids := ARRAY[]::uuid[];
		n_coaches := pg_temp.rand_int(2, 4);
		FOR i IN 1..n_coaches LOOP
			gender := pg_temp.rand_int(1, 2);
			fname := pg_temp.random_first_name(gender);
			lname := pg_temp.random_last_name();
			v_seq := nextval('tmp_user_seq');
			uname := 'coach' || v_seq || '.' || lower(lname);
			email := lower(fname) || '.' || lower(lname) || v_seq || '@example.com';

			coach_ids := coach_ids || pg_temp.create_user(1::smallint, uname, email, fname, lname, gender, 25, 50,
				loc.country, loc.city, loc.lat, loc.lon,
				'Certified coach specializing in martial arts training in ' || loc.city || '.');

			INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
			VALUES (gen_random_uuid(), coach_ids[i], gym_id, 1, 0, now());
		END LOOP;

		-- Athletes (30-60)
		athlete_ids := ARRAY[]::uuid[];
		n_athletes := pg_temp.rand_int(30, 60);
		FOR i IN 1..n_athletes LOOP
			gender := pg_temp.rand_int(1, 2);
			fname := pg_temp.random_first_name(gender);
			lname := pg_temp.random_last_name();
			v_seq := nextval('tmp_user_seq');
			uname := 'athlete' || v_seq || '.' || lower(lname);
			email := lower(fname) || '.' || lower(lname) || v_seq || '@example.com';

			athlete_ids := athlete_ids || pg_temp.create_user(3::smallint, uname, email, fname, lname, gender, 10, 35,
				loc.country, loc.city, loc.lat, loc.lon,
				'Dedicated athlete training at the ' || loc.city || ' club.');

			INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
			VALUES (gen_random_uuid(), athlete_ids[i], gym_id, 3, 0, now());
		END LOOP;

		-- Groups of 6-12 athletes, one coach per group (round-robin)
		start_idx := 1;
		j := 0;
		WHILE start_idx <= array_length(athlete_ids, 1) LOOP
			group_size := pg_temp.rand_int(6, 12);
			end_idx := LEAST(start_idx + group_size - 1, array_length(athlete_ids, 1));
			j := j + 1;

			group_id := gen_random_uuid();
			INSERT INTO groups (id, gym_id, name, description, status, created_at, updated_at)
			VALUES (group_id, gym_id, 'Group ' || j, 'Training group ' || j || ' at ' || loc.city, 0, now(), now());

			coach_pick := coach_ids[1 + mod(j - 1, array_length(coach_ids, 1))];
			INSERT INTO group_coaches (group_id, user_id) VALUES (group_id, coach_pick);

			FOR i IN start_idx..end_idx LOOP
				INSERT INTO group_athletes (group_id, user_id) VALUES (group_id, athlete_ids[i]);
			END LOOP;

			start_idx := end_idx + 1;
		END LOOP;
	END LOOP;
END $$;

-- =====================================================================================
-- 3) 30 Freelance Athletes (no gym affiliation) - includes 1 fixed demo account
-- =====================================================================================

DO $$
DECLARE
	loc     RECORD;
	gender  smallint;
	fname   text;
	lname   text;
	uname   text;
	email   text;
	v_seq   bigint;
	i       int;
BEGIN
	-- Fixed demo freelance athlete (used by the login page demo popup)
	SELECT * INTO loc FROM pg_temp.pick_location();
	PERFORM pg_temp.create_user(3::smallint, 'demo.freelancer', 'demo.freelancer@example.com', 'Demo', 'Freelancer', 2, 20, 30,
		loc.country, loc.city, loc.lat, loc.lon, 'Demo freelance athlete account for showcasing the platform.');

	-- 29 additional random freelance athletes
	FOR i IN 1..29 LOOP
		SELECT * INTO loc FROM pg_temp.pick_location();
		gender := pg_temp.rand_int(1, 2);
		fname := pg_temp.random_first_name(gender);
		lname := pg_temp.random_last_name();
		v_seq := nextval('tmp_user_seq');
		uname := 'freelancer' || v_seq || '.' || lower(lname);
		email := lower(fname) || '.' || lower(lname) || v_seq || '@example.com';

		PERFORM pg_temp.create_user(3::smallint, uname, email, fname, lname, gender, 16, 40,
			loc.country, loc.city, loc.lat, loc.lon,
			'Independent freelance athlete not affiliated with any gym.');
	END LOOP;
END $$;

-- =====================================================================================
-- 4) Demo Gym: 1 demo manager, 2 demo coaches, 40 demo athletes, 4 groups
-- =====================================================================================

DO $$
DECLARE
	demo_gym_id      uuid := gen_random_uuid();
	demo_manager_id  uuid;
	demo_coach1_id   uuid;
	demo_coach2_id   uuid;
	demo_athlete_ids uuid[] := ARRAY[]::uuid[];
	loc              RECORD;
	i                int;
	j                int;
	group_id         uuid;
	group_size       int := 10;
	start_idx        int;
	end_idx          int;
	gender           smallint;
	fname            text;
	lname            text;
	v_seq            bigint;
BEGIN
	SELECT * INTO loc FROM pg_temp.pick_location();

	demo_manager_id := pg_temp.create_user(2::smallint, 'demo.manager', 'demo.manager@example.com', 'Demo', 'Manager', 1, 35, 45,
		loc.country, loc.city, loc.lat, loc.lon, 'Demo gym manager account for platform demonstrations.');

	INSERT INTO gyms (
		id, name, address, latitude, longitude, gym_code, created_by,
		logo_image, phone, contact_email, description, status, created_at, updated_at
	) VALUES (
		demo_gym_id, 'Demo Dojo', pg_temp.rand_int(1, 199)::text || ' Demo Street, ' || loc.country,
		loc.lat, loc.lon, 'DEMOGYM1', demo_manager_id, '/assets/images/gyms/default-logo.png',
		'+301234567890', 'contact@demodojo.example.com',
		'The official demo gym used to showcase DojoCore features.', 0, now(), now()
	);

	INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
	VALUES (gen_random_uuid(), demo_manager_id, demo_gym_id, 2, 0, now());

	demo_coach1_id := pg_temp.create_user(1::smallint, 'demo.coach1', 'demo.coach1@example.com', 'Demo', 'CoachOne', 1, 28, 45,
		loc.country, loc.city, loc.lat, loc.lon, 'Demo coach account #1 for platform demonstrations.');
	demo_coach2_id := pg_temp.create_user(1::smallint, 'demo.coach2', 'demo.coach2@example.com', 'Demo', 'CoachTwo', 2, 28, 45,
		loc.country, loc.city, loc.lat, loc.lon, 'Demo coach account #2 for platform demonstrations.');

	INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at) VALUES
		(gen_random_uuid(), demo_coach1_id, demo_gym_id, 1, 0, now()),
		(gen_random_uuid(), demo_coach2_id, demo_gym_id, 1, 0, now());

	-- Fixed demo athlete (used by the login page demo popup)
	demo_athlete_ids := demo_athlete_ids || pg_temp.create_user(3::smallint, 'demo.athlete', 'demo.athlete@example.com', 'Demo', 'Athlete', 1, 18, 25,
		loc.country, loc.city, loc.lat, loc.lon, 'Demo athlete account for platform demonstrations.');
	INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
	VALUES (gen_random_uuid(), demo_athlete_ids[1], demo_gym_id, 3, 0, now());

	-- 39 additional demo athletes
	FOR i IN 2..40 LOOP
		gender := pg_temp.rand_int(1, 2);
		fname := pg_temp.random_first_name(gender);
		lname := pg_temp.random_last_name();
		v_seq := nextval('tmp_user_seq');

		demo_athlete_ids := demo_athlete_ids || pg_temp.create_user(3::smallint, 'demo.athlete' || v_seq,
			lower(fname) || '.' || lower(lname) || v_seq || '@example.com',
			fname, lname, gender, 10, 35, loc.country, loc.city, loc.lat, loc.lon,
			'Demo athlete training at Demo Dojo.');

		INSERT INTO user_gym (id, user_id, gym_id, role, status, created_at)
		VALUES (gen_random_uuid(), demo_athlete_ids[i], demo_gym_id, 3, 0, now());
	END LOOP;

	-- 4 groups of 10 athletes each, coaches alternated
	start_idx := 1;
	FOR i IN 1..4 LOOP
		end_idx := start_idx + group_size - 1;

		group_id := gen_random_uuid();
		INSERT INTO groups (id, gym_id, name, description, status, created_at, updated_at)
		VALUES (group_id, demo_gym_id, 'Demo Group ' || i, 'Demo training group ' || i, 0, now(), now());

		INSERT INTO group_coaches (group_id, user_id)
		VALUES (group_id, CASE WHEN i % 2 = 1 THEN demo_coach1_id ELSE demo_coach2_id END);

		FOR j IN start_idx..end_idx LOOP
			INSERT INTO group_athletes (group_id, user_id) VALUES (group_id, demo_athlete_ids[j]);
		END LOOP;

		start_idx := end_idx + 1;
	END LOOP;
END $$;

-- =====================================================================================
-- Persist everything and print a visible confirmation
-- =====================================================================================

DO $$
BEGIN
	RAISE NOTICE 'Seed complete -> users=%, gyms=%, groups=%',
		(SELECT count(*) FROM users),
		(SELECT count(*) FROM gyms),
		(SELECT count(*) FROM groups);
END $$;

COMMIT;

-- =====================================================================================
-- Verification summary
-- =====================================================================================

SELECT role,
	   CASE role WHEN 0 THEN 'Admin' WHEN 1 THEN 'Coach' WHEN 2 THEN 'Manager' WHEN 3 THEN 'Athlete' END AS role_name,
	   count(*) AS total
FROM users
GROUP BY role
ORDER BY role;

SELECT count(*) AS total_gyms FROM gyms;
SELECT count(*) AS total_groups FROM groups;
SELECT count(*) AS total_freelance_athletes
FROM users u
WHERE u.role = 3 AND NOT EXISTS (SELECT 1 FROM user_gym ug WHERE ug.user_id = u.id);
