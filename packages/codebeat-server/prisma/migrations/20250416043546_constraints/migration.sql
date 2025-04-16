-- Add unsupported database features
ALTER TABLE "Heartbeats" ADD CONSTRAINT "Lines_non_negative" CHECK ("lines" IS NULL OR "lines" >= 0),
ADD CONSTRAINT "Lineno_valid_range" CHECK (
    "lineno" IS NULL OR 
    ("lineno" >= 0 AND ("lines" IS NULL OR "lineno" <= "lines"))
),
ADD CONSTRAINT "Time_order" CHECK ("recvAt" >= "sendAt" AND "createdAt" >= "recvAt");