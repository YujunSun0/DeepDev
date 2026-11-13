import { ForbiddenException } from '@nestjs/common';
import { getLevelLockMessage, getPlanLimit } from './plan-limits';
import { UsageService } from './usage.service';

describe('플랜별 레벨 제한', () => {
  it.each([
    ['FREE', 2],
    ['PRO', 4],
    ['MASTER', 5],
  ])('%s 플랜은 Level %i까지 허용한다', (plan, max) => {
    expect(getPlanLimit(plan).maxLevel).toBe(max);
    expect(getLevelLockMessage(plan, max)).toBeNull();
    if (max < 5) expect(getLevelLockMessage(plan, max + 1)).not.toBeNull();
  });

  it('알 수 없는 플랜은 FREE 기준으로 본다', () => {
    expect(getLevelLockMessage('UNKNOWN', 3)).toContain('Level 2까지');
  });

  it('잠긴 레벨을 열 수 있는 가장 낮은 플랜을 안내한다', () => {
    expect(getLevelLockMessage('FREE', 3)).toBe(
      '현재 플랜(Free)에서는 Level 2까지 이용할 수 있습니다. Pro 플랜으로 업그레이드하면 Level 4까지 이용할 수 있어요.',
    );
    expect(getLevelLockMessage('PRO', 5)).toContain('Master 플랜으로 업그레이드하면 Level 5까지');
  });

  describe('UsageService.assertLevelAllowed', () => {
    const serviceFor = (planType: string | null) =>
      new UsageService({
        user: { findUnique: jest.fn(async () => (planType ? { planType } : null)) },
      } as any);

    it('플랜 한도를 넘는 레벨은 403으로 막는다', async () => {
      await expect(serviceFor('FREE').assertLevelAllowed('u', 3)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('한도 안의 레벨은 통과시킨다', async () => {
      await expect(serviceFor('FREE').assertLevelAllowed('u', 2)).resolves.toBeUndefined();
      await expect(serviceFor('PRO').assertLevelAllowed('u', 4)).resolves.toBeUndefined();
    });

    it('사용자를 못 찾으면 FREE로 취급한다', async () => {
      await expect(serviceFor(null).assertLevelAllowed('u', 3)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
