import { BrowserContext, Page, chromium, test } from '@playwright/test';

// 로그인하고, 프로필 입력 자동화
test('init', async () => {
  // 브라우저 인스턴스 생성
  const browser = await chromium.launch({
    headless: false, // GUI로 확인하기 위해 headless 모드 비활성화
  });

  const sessions: { context: BrowserContext; page: Page }[] = [];

  for (let i = 0; i < 99; i++) {
    // 각 세션마다 새로운 컨텍스트(=세션) 생성
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('http://local.socialdev.club:5173');

      // 세션 배열에 저장
      sessions.push({ context, page });

      console.log(`세션 ${i + 1} 생성 완료`);
    } catch (error) {
      console.error(`세션 ${i + 1} 생성 실패:`, error);
    }
  }

  // 세션 하나씩 `다른 방법으로 로그인` 버튼이 노출되면 클릭
  for (const session of sessions) {
    const loginButton = await session.page.locator('button:has-text("다른 방법으로 로그인")');
    await loginButton.click();
  }

  // 세션 index 01 ~ 99 로그인 시키기
  for (let i = 0; i < sessions.length; i++) {
    const emailInput = await sessions[i].page.locator('input[name="email"]');
    // i가 한자리면, 앞에 0을 붙여줌
    await emailInput.fill(`test${i + 1 < 10 ? '0' : ''}${i + 1}@socialdev.club`);

    const passwordInput = await sessions[i].page.locator('input[name="password"]');
    await passwordInput.fill(process.env.TEST_PASSWORD || '');

    const loginButton = await sessions[i].page.locator('button:has-text("로그인")');
    await loginButton.click();
    await loginButton.waitFor({ state: 'hidden' });

    const loginingButton = await sessions[i].page.locator('button:has-text("로그인 중...")');
    await loginingButton.waitFor({ state: 'hidden' });

    // `Request rate limit reached` 노출되면 테스트 실패
    const errorMessage = await sessions[i].page.locator('span:has-text("Request rate limit reached")');
    if (await errorMessage.isVisible()) {
      throw new Error(`세션 ${i + 1} 로그인 실패: Request rate limit reached`);
    }

    console.log(`세션 ${i + 1} 로그인 완료`);
  }

  for (let i = 0; i < sessions.length; i++) {
    const submitButton = await sessions[i].page.locator('button:has-text("저장")');
    const joinButton = await sessions[i].page.locator('button:has-text("참가")');

    await Promise.race([submitButton.waitFor({ state: 'visible' }), joinButton.waitFor({ state: 'visible' })]);

    // pathname이 `/profile` 이면 프로필 입력하기
    const pathname = await sessions[i].page.url();
    if (!pathname.includes('/profile')) {
      console.log(`세션 ${i + 1} 프로필 입력 생략`);
      continue;
    }

    const nicknameInput = await sessions[i].page.locator('input[name="nickname"]');
    await nicknameInput.fill(`test${i + 1 < 10 ? '0' : ''}${i + 1}`);

    // i가 홀수면 남성, 짝수명 여성 radio 클릭
    const genderRadio = await sessions[i].page.locator(`input[value="${i % 2 === 0 ? 'M' : 'F'}"]`);
    await genderRadio.click();

    // 저장 버튼 클릭
    await submitButton.click();

    console.log(`세션 ${i + 1} 프로필 저장 완료`);
  }

  // 모든 세션이 유지되도록 대기
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  // 정리: 모든 세션 종료
  for (const session of sessions) {
    await session.page.close();
    await session.context.close();
  }
  await browser.close();
});
