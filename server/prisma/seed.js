import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data to prevent duplicates on re-seed
  console.log('🧹 Cleaning existing data...')
  await prisma.comment.deleteMany()
  await prisma.like.deleteMany()
  await prisma.postHashtag.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 12)

  // 1. Create Users
  console.log('👥 Creating users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'alex_dev',
        email: 'alex@example.com',
        displayName: 'Alex Chen',
        passwordHash,
        bio: 'Frontend engineer & UI enthusiast. Love building cool stuff.',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'sarah_styles',
        email: 'sarah@example.com',
        displayName: 'Sarah Jenkins',
        passwordHash,
        bio: 'Digital artist | Design Systems | Coffee addict ☕️',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
    }),
    prisma.user.create({
      data: {
        username: 'neon_nights',
        email: 'neon@example.com',
        displayName: 'Marcus Neon',
        passwordHash,
        bio: 'Night photography is my passion 📸 Tokyo based.',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
      },
    }),
  ])

  const [alex, sarah, marcus] = users

  // 2. Create Follows
  console.log('🤝 Creating connections...')
  await prisma.follow.createMany({
    data: [
      { followerId: alex.id, followingId: sarah.id },
      { followerId: sarah.id, followingId: alex.id },
      { followerId: marcus.id, followingId: alex.id },
    ],
  })

  // 3. Create Hashtags
  const techTag = await prisma.hashtag.create({ data: { name: 'tech' } })
  const designTag = await prisma.hashtag.create({ data: { name: 'design' } })
  const photoTag = await prisma.hashtag.create({ data: { name: 'photography' } })

  // 4. Create Posts
  console.log('📝 Creating posts...')
  
  const post1 = await prisma.post.create({
    data: {
      authorId: sarah.id,
      content: 'Just finished setting up my new workspace! Loving the dark aesthetics. #design #tech',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
      hashtags: {
        create: [
          { hashtag: { connect: { id: designTag.id } } },
          { hashtag: { connect: { id: techTag.id } } },
        ],
      },
    },
  })

  const post2 = await prisma.post.create({
    data: {
      authorId: marcus.id,
      content: 'Late night walks in Shibuya. The neon lights here never get old. 🌃 #photography',
      imageUrl: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&w=800&q=80',
      hashtags: {
        create: [
          { hashtag: { connect: { id: photoTag.id } } },
        ],
      },
    },
  })

  const post3 = await prisma.post.create({
    data: {
      authorId: alex.id,
      content: 'Has anyone tried the new React 19 features? The compiler looks incredible! Let me know your thoughts.',
      hashtags: {
        create: [
          { hashtag: { connect: { id: techTag.id } } },
        ],
      },
    },
  })

  // 5. Create interactions (Likes and Comments)
  console.log('💬 Adding interactions...')
  
  await prisma.like.createMany({
    data: [
      { userId: alex.id, postId: post1.id },
      { userId: marcus.id, postId: post1.id },
      { userId: sarah.id, postId: post2.id },
    ],
  })

  await prisma.comment.create({
    data: {
      content: 'Looks super clean! What monitor is that?',
      authorId: alex.id,
      postId: post1.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Stunning capture! The colors are amazing.',
      authorId: sarah.id,
      postId: post2.id,
    },
  })

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
