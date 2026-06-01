import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const options: StrategyOptions = {
      clientID: configService.get('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile'],
    }
    super(options)
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, name, emails, photos } = profile
    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos && photos[0] ? photos[0].value : undefined,
    }
    done(null, user)
  }
}
