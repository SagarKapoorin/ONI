import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: passwordHash,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: passwordHash,
      name: 'Regular User',
      role: 'USER'
    }
  })

  const author1 = await prisma.author.create({
    data: {
      name: 'Author One',
      books: {
        create: [
          { title: 'Book One A' },
          { title: 'Book One B' }
        ]
      }
    }
  })

  await prisma.author.create({
    data: {
      name: 'Author Two',
      books: {
        create: [
          { title: 'Book Two A' },
          { title: 'Book Two B' }
        ]
      }
    }
  })

  const bookToBorrow = await prisma.book.findFirst({
    where: { authorId: author1.id }
  })

  if (bookToBorrow) {
    await prisma.borrowedBook.create({
      data: {
        userId: user.id,
        bookId: bookToBorrow.id
      }
    })
    await prisma.book.update({
      where: { id: bookToBorrow.id },
      data: { isBorrowed: true }
    })
  }
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
