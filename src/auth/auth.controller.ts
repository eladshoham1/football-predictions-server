import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './google.guard'
import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: any) {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // req.user is set by passport after successful Google OAuth
    const googleProfile = req.user
    const user = await this.svc.findOrCreateGoogleUser(googleProfile)
    const token = this.svc.generateJwt(user.id)

    // Redirect to client with token in URL query
    const clientUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(`${clientUrl}/?token=${token}`)
  }

  @Get('me')
  async me(@Req() req: any) {
    const auth = req.headers.authorization
    if (!auth) throw new UnauthorizedException()
    const token = auth.replace(/^Bearer\s+/, '')
    const user = await this.svc.verifyToken(token)
    if (!user) throw new UnauthorizedException()
    return user
  }
}
