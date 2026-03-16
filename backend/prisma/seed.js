require('../src/config/env');
const prisma = require('../src/config/prisma');

async function main() {
  console.log('Starting DB seed...');

  // 1. Create Users
  const users = [];
  for (let i = 1; i <= 6; i++) {
    const user = await prisma.user.upsert({
      where: { email: `seeduser${i}@example.com` },
      update: {},
      create: {
        uid: `seed_user_uid_${i}`,
        email: `seeduser${i}@example.com`,
        name: `Seed User ${i}`,
        role: 'USER',
        notificationPreferences: {
          create: {
            receivePushNotifications: true,
            isMuted: false,
          }
        }
      },
    });
    users.push(user);
    console.log(`Created user: ${user.name}`);
  }

  // 2. Create Topics
  const topicNames = ['Technology', 'Sports', 'Politics', 'Entertainment', 'Health', 'Science', 'Business'];
  const topics = [];
  for (const name of topicNames) {
    const topic = await prisma.topic.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: `All the latest news about ${name}. Stay updated with real-time alerts.`,
      },
    });
    topics.push(topic);
    console.log(`Created topic: ${topic.name}`);
  }

  // 3. Create Articles for each topic
  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    for (let j = 1; j <= 6; j++) {
      const title = `${topic.name} News Article ${j}`;
      const existingNews = await prisma.news.findFirst({ where: { title } });
      
      if (!existingNews) {
        // randomly pick an author from our seed users
        const author = users[(i + j) % users.length];
        
        await prisma.news.create({
          data: {
            title,
            description: `This is the description for ${title}. It provides a brief overview of the article content.`,
            content: `This is the full content for ${title}. It contains all the detailed information about the topic.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            imageUrl: `https://picsum.photos/seed/${topic.name}${j}/800/400`,
            isPublished: true,
            publishedAt: new Date(Date.now() - Math.random() * 10000000000), // Random publish date
            author: {
              connect: { uid: author.uid }
            },
            topics: {
              create: [
                {
                  topic: { connect: { id: topic.id } }
                }
              ]
            }
          }
        });
        console.log(`Created news article: ${title}`);
      }
    }
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
