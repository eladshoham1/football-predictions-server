import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateGoogleUser(profile: { googleId: string; email: string; firstName: string; lastName: string; picture?: string }) {
    let user = await this.prisma.user.findUnique({ where: { googleId: profile.googleId } })
    
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { email: profile.email } })
    }

    if (!user) {
      const name = `${profile.firstName} ${profile.lastName}`.trim() || profile.email
      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          name,
          avatarUrl: profile.picture,
          lastLoginAt: new Date(),
        },
      })
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          avatarUrl: profile.picture || user.avatarUrl,
        },
      })
    }

    return user
  }

  generateJwt(userId: string): string {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      if (!decoded?.sub) return null
      return await this.prisma.user.findUnique({ where: { id: decoded.sub } })
    } catch (e) {
      return null
    }
  }
}
