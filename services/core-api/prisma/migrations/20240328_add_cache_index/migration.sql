-- Add index for cache performance
CREATE INDEX idx_event_cache ON "Event" (type, "createdAt" DESC) 
WHERE type LIKE 'cache.%';

-- Add index for event processing
CREATE INDEX idx_event_processing ON "Event" ((metadata->>'processed'), "createdAt" ASC)
WHERE metadata->>'processed' = 'false';

-- Add index for WebSocket event queries
CREATE INDEX idx_event_websocket ON "Event" ("createdAt" DESC, (data->>'userId'), (data->>'companyId'))
WHERE type LIKE 'websocket.%';

-- Add index for faster event type queries
CREATE INDEX idx_event_type ON "Event" (type, "createdAt" DESC);