-- Restructure messages table to mirror WeChat WeixinMessage 1:1
-- Drop old columns, add WeChat-native columns

-- Add new columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS seq BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_id BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS from_user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS to_user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_id TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS create_time_ms BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS update_time_ms BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delete_time_ms BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS session_id TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS group_id TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type INT NOT NULL DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_state INT NOT NULL DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS item_list JSONB NOT NULL DEFAULT '[]';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS context_token TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_status TEXT NOT NULL DEFAULT '';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_keys JSONB NOT NULL DEFAULT '{}';

-- Migrate data from old columns
UPDATE messages SET
    from_user_id = COALESCE(sender, ''),
    to_user_id = COALESCE(recipient, '')
WHERE from_user_id = '' AND (sender != '' OR recipient != '');

-- Drop old columns
ALTER TABLE messages DROP COLUMN IF EXISTS sender;
ALTER TABLE messages DROP COLUMN IF EXISTS recipient;
ALTER TABLE messages DROP COLUMN IF EXISTS msg_type;
ALTER TABLE messages DROP COLUMN IF EXISTS payload;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_seq ON messages(bot_id, seq) WHERE seq IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(bot_id, from_user_id) WHERE from_user_id != '';
