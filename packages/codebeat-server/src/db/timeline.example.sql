WITH HeartbeatData AS (
    SELECT 
        id,
        "project",
        "sendAt",
        "language",
        LAG("project") OVER (ORDER BY "sendAt") as prev_project,
        LAG("sendAt") OVER (ORDER BY "sendAt") as prev_send_at,
        LEAD("project") OVER (ORDER BY "sendAt") as next_project,
        LEAD("sendAt") OVER (ORDER BY "sendAt") as next_send_at,
        EXTRACT(EPOCH FROM ("sendAt" - LAG("sendAt") OVER (ORDER BY "sendAt"))) AS prev_time_diff,
        EXTRACT(EPOCH FROM (LEAD("sendAt") OVER (ORDER BY "sendAt") - "sendAt")) AS next_time_diff
    FROM "Heartbeat"
    WHERE 
        "sendAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '3 day')::timestamp AND 
        (CURRENT_DATE - INTERVAL '2 day')::timestamp
),
PeriodStarts AS (
    SELECT 
        *,
        CASE 
            WHEN prev_project IS NULL THEN 1 -- First record
            WHEN prev_project != "project" THEN 1 -- Project changed
            WHEN prev_time_diff IS NULL OR prev_time_diff > 15 * 60 THEN 1 -- Gap >15 minutes
            ELSE 0
        END AS is_period_start
    FROM HeartbeatData
),
PeriodGroups AS (
    SELECT 
        *,
        SUM(is_period_start) OVER (ORDER BY "sendAt") AS period_id
    FROM PeriodStarts
),
PeriodBoundaries AS (
    SELECT 
        period_id,
        "project",
        MIN("sendAt") AS period_start,
        MAX("sendAt") AS period_end_raw,
        MIN(CASE 
            WHEN next_project != "project" AND next_time_diff <= 15 * 60 
            THEN next_send_at 
            ELSE NULL 
        END) AS next_period_start
    FROM PeriodGroups
    GROUP BY period_id, "project"
),
UniqueLanguages AS (
    SELECT 
        period_id,
        "language"
    FROM PeriodGroups
    GROUP BY period_id, "language"
),
AggregatedLanguages AS (
    SELECT 
        period_id,
        STRING_AGG("language", ', ' ORDER BY "language") AS languages_used
    FROM UniqueLanguages
    GROUP BY period_id
),
FinalPeriods AS (
    SELECT 
        pb.period_id,
        pb."project",
        pb.period_start,
        COALESCE(pb.next_period_start, pb.period_end_raw) AS period_end,
        COUNT(*) AS heartbeat_count,
        al.languages_used
    FROM PeriodBoundaries pb
    JOIN PeriodGroups pg ON pb.period_id = pg.period_id
    LEFT JOIN AggregatedLanguages al ON pb.period_id = al.period_id
    GROUP BY pb.period_id, pb."project", pb.period_start, pb.period_end_raw, pb.next_period_start, al.languages_used
)
SELECT 
    period_id,
    "project",
    period_start,
    period_end,
    EXTRACT(EPOCH FROM (period_end - period_start)) AS duration_seconds,
    heartbeat_count,
    languages_used
FROM FinalPeriods
WHERE 
    period_end > period_start
ORDER BY period_start;
