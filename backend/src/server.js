const env = require("./config/env");
const cron = require("node-cron");
const {
    getPendingScheduled,
    processScheduledPush,
} = require("./services/notification.service");
const {
    processScheduledNews,
    publishNews,
} = require("./services/news.service");
const { notifyNewsPublished } = require("./services/notification.service");

const app = require("./app");
require("./config/firebase");
const prisma = require("./config/prisma");

prisma
    .$connect()
    .then(() => {
        console.log("Database connected");
    })
    .catch(() => {
        console.log("Database not connected");
    });

// Run cron job every minute to check for scheduled notifications
cron.schedule("* * * * *", async () => {
    try {
        const scheduled = await getPendingScheduled();
        if (scheduled.length > 0) {
            console.log(
                `[Cron] Found ${scheduled.length} scheduled notifications to process.`,
            );
            for (const notification of scheduled) {
                // process each asynchronously or wait for them?
                // typically processing them sequentially or in a promise pool is best
                await processScheduledPush(notification.id).catch((e) => {
                    console.error(
                        `[Cron] Error processing notification ${notification.id}:`,
                        e,
                    );
                });
            }
        }
    } catch (error) {
        console.error("[Cron] Error fetching scheduled notifications:", error);
    }
});

// Run cron job every minute to auto-publish scheduled news articles
cron.schedule("* * * * *", async () => {
    try {
        const due = await processScheduledNews();
        for (const item of due) {
            try {
                const news = await publishNews(item.id);
                notifyNewsPublished(
                    item.id,
                    news.title,
                    news.description,
                ).catch((e) =>
                    console.error(`[Cron News Notify] ${item.id}:`, e),
                );
            } catch (e) {
                console.error(`[Cron] Error publishing news ${item.id}:`, e);
            }
        }
        if (due.length > 0)
            console.log(
                `[Cron] Auto-published ${due.length} scheduled news articles.`,
            );
    } catch (error) {
        console.error("[Cron News] Error:", error);
    }
});

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
