import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

export interface GoogleProfile {
  provider: 'google';
  providerId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'disabled';
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET') || 'disabled';
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/api/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  get isConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google 프로필에서 이메일을 가져올 수 없습니다.'), undefined);
      return;
    }

    const result: GoogleProfile = {
      provider: 'google',
      providerId: profile.id,
      email,
      name: profile.displayName || profile.name?.givenName || null,
      avatarUrl: profile.photos?.[0]?.value || null,
    };

    done(null, result);
  }
}
