-- =========================================
-- TABLE: USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username nvarchar(50) UNIQUE NOT NULL,
    password_hash nvarchar(30)NOT NULL,
    email nvarchar(100) UNIQUE,

    role SMALLINT NOT NULL,        -- 0 admin, 1 coach, 2 manager, 3 athlete
    status SMALLINT DEFAULT 0,     -- 0 pending, 1 approved, 2 inprogress, 3 rejected

    gender SMALLINT,               -- 0 female, 1 male, 2 other
    date_of_birth DATE,

    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- CONSTRAINTS
    CONSTRAINT chk_role CHECK (role IN (0,1,2,3)),
    CONSTRAINT chk_status CHECK (status IN (0,1,2,3)),
    CONSTRAINT chk_gender CHECK (gender IN (0,1,2)),

    CONSTRAINT chk_user_lat_lng CHECK (
        latitude IS NULL OR (
            latitude BETWEEN -90 AND 90 AND
            longitude BETWEEN -180 AND 180
        )
    )
);


-- =========================================
-- TABLE: GYMS
-- =========================================
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name nvarchar(100) NOT NULL,
    gym_code nvarchar(20) UNIQUE NOT NULL,

    address nvarchar(30) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(POINT, 4326),

    created_by UUID REFERENCES users(id),

    status SMALLINT DEFAULT 0, -- status mapping

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_gym_status CHECK (status IN (0,1,2,3)),

    CONSTRAINT chk_gym_lat_lng CHECK (
        latitude BETWEEN -90 AND 90 AND
        longitude BETWEEN -180 AND 180
    )
);


-- =========================================
-- TABLE: USER_GYM
-- =========================================
CREATE TABLE IF NOT EXISTS user_gym (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,

    role_in_gym SMALLINT,
    status SMALLINT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_role_in_gym CHECK (role_in_gym IN (0,1,2,3)),
    CONSTRAINT chk_usergym_status CHECK (status IN (0,1,2,3))
);


-- =========================================
-- TABLE: DOCUMENTS
-- =========================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,

    file_url nvarchar(60) NOT NULL,
    type nvarchar(50),

    status SMALLINT DEFAULT 0,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_doc_status CHECK (status IN (0,1,2,3))
);