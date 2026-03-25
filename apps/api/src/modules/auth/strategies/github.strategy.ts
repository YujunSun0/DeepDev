import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-github2';

export interface GithubProfile {
  provider: 'github';
  providerId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GITHUB_CLIENT_ID') || 'disabled';
    const clientSecret = config.get<string>('GITHUB_CLIENT_SECRET') || 'disabled';
    const callbackURL =
      config.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:4000/api/auth/github/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email', 'read:user'],
    });
  }

  get isConfigured(): boolean {
    return !!(
      process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CALLBACK_URL
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, profile?: GithubProfile) => void,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value ?? null;
    if (!email) {
      return done(
        new Error('GitHub 프로필에서 이메일을 가져올 수 없습니다. GitHub 설정에서 이메일 공개를 허용해주세요.'),
      );
    }

    const result: GithubProfile = {
      provider: 'github',
      providerId: profile.id,
      email,
      name: profile.displayName || profile.username || null,
      avatarUrl: profile.photos?.[0]?.value || (profile as { _json?: { avatar_url?: string } })._json?.avatar_url || null,
    };

    return done(null, result);
  }
}
