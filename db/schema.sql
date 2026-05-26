-- Create the transaction history table
CREATE TABLE IF NOT EXISTS potdo_transactions (
    id BIGSERIAL PRIMARY KEY,
    sender TEXT NOT NULL,
    command TEXT NOT NULL,
    intent JSONB NOT NULL,
    tx_hash TEXT,
    block_number BIGINT,
    status TEXT NOT NULL,
    error_message TEXT,
    gas_fee TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE potdo_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow anyone to read history, and clients to insert)
CREATE POLICY "Allow public read access" ON potdo_transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON potdo_transactions
    FOR INSERT WITH CHECK (true);
