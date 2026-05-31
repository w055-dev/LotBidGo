DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS lots CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS auction_format CASCADE;
DROP TYPE IF EXISTS lot_status CASCADE;
DROP FUNCTION IF EXISTS update_lot_status_on_sale() CASCADE;
DROP FUNCTION IF EXISTS update_lot_status_on_bid() CASCADE;

CREATE TYPE auction_format AS ENUM ('очный', 'онлайн', 'гибридный');
CREATE TYPE lot_status AS ENUM ('listed', 'in_auction', 'sold', 'unsold', 'withdrawn');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_seller BOOLEAN DEFAULT false,
    is_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    format auction_format NOT NULL DEFAULT 'очный',
    specification TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lots (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lot_number INTEGER NOT NULL,
    description TEXT,
    start_price DECIMAL(12, 2) NOT NULL CHECK (start_price > 0),
    bid_step DECIMAL(12, 2) DEFAULT NULL,
	status lot_status NOT NULL DEFAULT 'listed',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (auction_id, lot_number)
);

CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER REFERENCES lots(id) ON DELETE CASCADE,
    bidder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    bid_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    lot_id INTEGER UNIQUE REFERENCES lots(id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    final_price DECIMAL(12, 2) NOT NULL CHECK (final_price > 0),
    sale_time TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_lot_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lot_number := (SELECT COALESCE(MAX(lot_number), 0) + 1 FROM lots WHERE auction_id = NEW.auction_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_lot_insert
BEFORE INSERT ON lots
FOR EACH ROW
EXECUTE FUNCTION set_lot_number();

CREATE OR REPLACE FUNCTION update_lot_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE lots SET status = 'sold' WHERE id = NEW.lot_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER after_sale_insert
AFTER INSERT ON sales
FOR EACH ROW
EXECUTE FUNCTION update_lot_status_on_sale();

CREATE OR REPLACE FUNCTION update_lot_status_on_bid()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE lots SET status = 'in_auction' WHERE id = NEW.lot_id AND status = 'listed';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER after_first_bid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION update_lot_status_on_bid();

INSERT INTO users (name, email, password_hash, is_seller, is_buyer, role)
VALUES (
    'Администратор',
    'admin@lotbidgo.ru',
    '$2b$10$aBu6P6x/CAgpbHKlbXJStOSlHCHZZQENOA7Ihq9JDSaSc5FyvtBlO',
    true,
    true,
    'admin'
),
(
	'Продавец',
    'seller@lotbidgo.ru',
    '$2b$10$Gx6Vs7RaVY.ZNMN8oidKYOvXZLWbg8W9r8i8XViXVgRzclvWvxIHa',
    true,
    true,
    'user'
);