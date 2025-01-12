import test, { BrowserContext, Page, Response, chromium, expect } from '@playwright/test';

const playerLength = Number(process.env.TEST_STOCK_PLAYER_LENGTH);
const fluctuationsInterval = Number(process.env.TEST_STOCK_FLUCTUATIONS_INTERVAL);

test('stock', async () => {
  // 브라우저 인스턴스 생성
  const browser = await chromium.launch({
    headless: false, // GUI로 확인하기 위해 headless 모드 비활성화
  });

  const sessions: { context: BrowserContext; page: Page; isAdmin: boolean }[] = [];

  for (let i = 0; i < playerLength + 1; i++) {
    // 각 세션마다 새로운 컨텍스트(=세션) 생성
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto('http://local.socialdev.club:5173');

      // 마지막 세션은 백오피스 관리하는 관리자
      const isAdmin = i === playerLength;
      sessions.push({ context, isAdmin, page });

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

  // 세션 로그인 시키기
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    const emailInput = session.page.locator('input[name="email"]');
    await emailInput.fill(`test${i + 1 < 10 ? '0' : ''}${i + 1}@socialdev.club`);

    const passwordInput = session.page.locator('input[name="password"]');
    await passwordInput.fill(process.env.TEST_PASSWORD || '');

    const loginButton = session.page.locator('button:has-text("로그인")');
    await loginButton.click();
    await loginButton.waitFor({ state: 'hidden' });

    const loginingButton = session.page.locator('button:has-text("로그인 중...")');
    await loginingButton.waitFor({ state: 'hidden' });

    // `Request rate limit reached` 노출되면 테스트 실패
    const errorMessage = session.page.locator('span:has-text("Request rate limit reached")');
    if (await errorMessage.isVisible()) {
      throw new Error(`세션 ${i + 1} 로그인 실패: Request rate limit reached`);
    }

    console.log(`세션 ${i + 1} 로그인 완료`);
  }

  const backofficeSession = sessions.find(({ isAdmin }) => isAdmin)!;
  await backofficeSession.page.goto('http://local.socialdev.club:5173/backoffice/party');

  // title 지정
  const title = `TEST_PARTY_${new Date().getTime()}`;
  const titleInput = backofficeSession.page.locator('input[name="title"]');
  await titleInput.fill(title);

  // 전체 인원 지정
  const limitAllCountInput = backofficeSession.page.locator('input[name="limitAllCount"]');
  await limitAllCountInput.fill('100');

  // 네트워크 응답 받아와서 id 추출
  const partyId = await new Promise<string>((resolve) => {
    const handlerResponse = async (response: Response): Promise<void> => {
      if (response.url().endsWith('/party') && response.request().method() === 'POST') {
        const responseJson = await response.json();

        const partyId = responseJson._id;
        backofficeSession.context.off('response', handlerResponse);
        resolve(partyId);
      }
    };
    backofficeSession.context.on('response', handlerResponse);

    // 파티 생성 버튼 클릭
    const partyCreateButton = backofficeSession.page.locator('button:has-text("생성")');
    partyCreateButton.click();
  });

  // 세션을 그룹으로 나누어 파티 참가 처리
  const BATCH_SIZE = 6; // 한 번에 처리할 세션 수
  const nonAdminSessions = sessions.filter((session) => !session.isAdmin);

  for (let i = 0; i < nonAdminSessions.length; i += BATCH_SIZE) {
    const sessionBatch = nonAdminSessions.slice(i, i + BATCH_SIZE);

    await Promise.all(
      sessionBatch.map(async (session) => {
        await session.page.reload();
        await session.page.waitForLoadState('domcontentloaded');

        // 버튼이 보일 때까지 대기
        const partyButton = session.page.locator(`button[data-id="${partyId}"]`);
        await partyButton.waitFor({ state: 'visible' });
        // data-id === partyId 인 버튼 클릭
        await partyButton.click({ timeout: 5000 });
        // 주소 바뀔떄까지 대기
        await session.page.waitForURL((url) => url.pathname.includes(`party`));
      }),
    );

    // 각 배치 처리 후 잠시 대기
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    console.log(`${i + BATCH_SIZE}명의 참가자 파티 참가 완료`);
  }

  await backofficeSession.page.goto(`http://local.socialdev.club:5173/backoffice/stock`);

  // 주식 게임 세션 생성
  const stockId = await new Promise<string>((resolve) => {
    const handlerResponse = async (response: Response): Promise<void> => {
      if (response.url().endsWith('/stock/create') && response.request().method() === 'POST') {
        if (!`${response.status()}`.startsWith('2')) {
          throw new Error(`파티 생성 실패: ${response.status()}`);
        }
        const responseJson = await response.json();

        const stockId = responseJson._id;
        backofficeSession.context.off('response', handlerResponse);
        resolve(stockId);
      }
    };
    backofficeSession.context.on('response', handlerResponse);

    // `주식게임 세션 생성` 버튼 클릭
    const stockCreateButton = backofficeSession.page.locator('button:has-text("주식게임 세션 생성")');
    stockCreateButton.click();
  });

  await backofficeSession.page.goto(`http://local.socialdev.club:5173/backoffice/party/${partyId}`);

  // input type="radio" and value="STOCK"
  const stockRadio = backofficeSession.page.locator('input[type="radio"][value="STOCK"]');
  await stockRadio.click();

  const activityNameInput = backofficeSession.page.locator('input[name="activityName"]');
  await activityNameInput.fill(stockId);

  // `적용` 버튼 클릭
  const applyButton = backofficeSession.page.locator('button:has-text("적용")');
  await applyButton.click();

  // 주식게임 백오피스 이동
  await backofficeSession.page.goto(`http://local.socialdev.club:5173/backoffice/stock/${stockId}`);

  // 주식게임 백오피스 이동 후 참가자 등록 대기
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  // `주식 초기화` 버튼 클릭
  const stockResetButton = backofficeSession.page.locator('button:has-text("주식 초기화")');
  await stockResetButton.click();

  // 주식 초기화 대기
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  // 시세변동주기 1분으로 설정
  const fluctuationsIntervalInput = backofficeSession.page.locator('input[placeholder*="시세변동주기"]');
  await fluctuationsIntervalInput.fill(`${fluctuationsInterval}`);
  await fluctuationsIntervalInput.press('Enter');

  // `주식 거래 활성화` 버튼 클릭
  const stockTradeActivateButton = backofficeSession.page.locator('button:has-text("주식 거래 활성화")');
  await stockTradeActivateButton.click();

  // 게임 시간 설정
  const startTime = new Date();
  const gameDuration = 9 * fluctuationsInterval * 60 * 1000; // 9라운드 총 게임 시간

  while (true) {
    const currentTime = new Date();
    const elapsedTime = currentTime.getTime() - startTime.getTime();

    // 9분이 지나면 result 버튼 클릭하고 종료
    if (elapsedTime >= gameDuration) break;

    for (let i = 0; i < nonAdminSessions.length; i += BATCH_SIZE) {
      const sessionBatch = nonAdminSessions.slice(i, i + BATCH_SIZE);

      await Promise.all([
        sessionBatch.map(async (session, batchIndex) => {
          try {
            await session.page.goto(`http://local.socialdev.club:5173/party/${partyId}?page=사기`);
            await session.page.waitForLoadState('domcontentloaded');

            // 여러 개의 활성화된 `사기` 버튼 중 하나 클릭
            const buyButtons = session.page.locator('button[name="buy"]');
            await expect(buyButtons.first()).toBeVisible();
            const buyButtonCount = await buyButtons.count();
            await buyButtons.nth(Math.floor(Math.random() * buyButtonCount)).click();

            await session.page.goto(`http://local.socialdev.club:5173/party/${partyId}?page=팔기`);
            await session.page.waitForLoadState('domcontentloaded');

            // 여러 개의 활성화된 `팔기` 버튼 중 하나 클릭
            const sellButtons = session.page.locator('button[name="sell"]');
            const sellButtonCount = await sellButtons.count();
            await sellButtons.nth(Math.floor(Math.random() * sellButtonCount)).click();
          } catch (error) {
            console.error(`세션 ${i + batchIndex + 1} 사기/팔기 에러:`, error);
          }
        }),
        new Promise((resolve) => {
          setTimeout(resolve, 5000);
        }),
      ]);

      // 각 배치 처리 후 잠시 대기
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }
  }

  // `주식 종료 및 정산` 버튼 클릭
  const finishButton = backofficeSession.page.locator('button:has-text("주식 종료 및 정산")');
  await finishButton.click();

  // 잠시 대기 후 result 버튼 클릭
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  const resultButton = backofficeSession.page.locator('button:has-text("RESULT")');
  await resultButton.click();

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
