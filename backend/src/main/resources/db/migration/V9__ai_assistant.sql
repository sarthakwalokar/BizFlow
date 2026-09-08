-- ==============================================================================
-- BizFlow Migration: V9__ai_assistant.sql
-- Module: AI Business Assistant and Conversation History
-- ==============================================================================

-- AI Conversations Table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL, -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    provider_used VARCHAR(100),
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compound Performance Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conv_biz_user ON ai_conversations(business_id, user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_msg_conv_created ON ai_messages(conversation_id, created_at ASC);
