import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import mongoose, { MongooseQueryOptions } from 'mongoose';
import { DeleteOptions, UpdateOptions } from 'mongodb';
import { CompanyInfo, Response } from 'shared~type-stock';
import dayjs from 'dayjs';
import { InjectConnection } from '@nestjs/mongoose';
import { getDateDistance } from '@toss/date';
import { StockConfig } from 'shared~config';
import { OpenAI } from 'openai';
import { StockUser } from './user.schema';
import { UserRepository } from './user.repository';
import { StockRepository } from '../stock.repository';

@Injectable()
export class UserService {
  private openai?: OpenAI;

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly userRepository: UserRepository,
    private readonly stockRepository: StockRepository,
  ) {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  transStockUserToDto(stockUser: StockUser): Response.GetStockUser {
    const user = { ...stockUser } as unknown as Response.GetStockUser;

    if (user.lastActivityTime) {
      user.lastActivityTime = dayjs(user.lastActivityTime).utcOffset('9').format('YYYY-MM-DDTHH:mm:ssZ');
    }

    return user;
  }

  getUserList(stockId: string): Promise<StockUser[]> {
    return this.userRepository.findUsers(stockId);
  }

  async getRecommendedPartners(stockId: string, userId: string): Promise<string[]> {
    const stock = await this.stockRepository.findOneById(stockId, { companies: 1 });
    const users = await this.getUserList(stockId);

    const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;

    const [partnerIds] = Array.from(companies.entries()).reduce(
      (reducer, [_, companyInfos]) => {
        const [partnerIds] = reducer;

        companyInfos.forEach((_, idx) => {
          if (companyInfos[idx].정보.some((name) => name === userId)) {
            const partners = companyInfos[idx].정보.filter((name) => name !== userId);
            partners.forEach((partner) => {
              if (partner && !partnerIds.some((v) => v === partner)) {
                partnerIds.push(partner);
              }
            });
          }
        });

        return reducer;
      },
      [[], []] as [Array<string>, Array<{ company: string; timeIdx: number; price: number }>],
    );

    return users
      .map((user) => {
        if (partnerIds.some((partnerId) => partnerId === user.userId)) {
          return user.userInfo.nickname;
        }
        return undefined;
      })
      .filter((user) => Boolean(user));
  }

  findOneByUserId(stockId: string, userId: string): Promise<StockUser | null> {
    return this.userRepository.findUser(stockId, userId);
  }

  async setUser(stockId: string, user: StockUser): Promise<boolean> {
    const result = await this.userRepository.updateUser(stockId, user.userId, user);
    return result !== null;
  }

  async alignIndex(stockId: string): Promise<void> {
    // 해당 주식방의 모든 사용자 목록을 가져옵니다
    const allUsers = await this.getUserList(stockId);

    // 성별로 사용자 분류
    const maleUsers = allUsers.filter((user) => user.userInfo.gender === 'M');
    const femaleUsers = allUsers.filter((user) => user.userInfo.gender === 'F');

    // 남녀 교차로 배치할 최종 순서 생성
    const alignedUsers: StockUser[] = [];
    const maxLength = Math.max(femaleUsers.length, maleUsers.length);

    for (let i = 0; i < maxLength; i++) {
      // 남성 배치
      if (i < maleUsers.length) {
        alignedUsers.push(maleUsers[i]);
      }
      // 여성 배치
      if (i < femaleUsers.length) {
        alignedUsers.push(femaleUsers[i]);
      }
    }

    // 인덱스 업데이트
    for (let i = 0; i < alignedUsers.length; i++) {
      await this.userRepository.updateUser(stockId, alignedUsers[i].userId, { $set: { index: i } });
    }
  }

  async alignIndexByOpenAI(stockId: string): Promise<void> {
    if (!this.openai) {
      console.warn('OpenAI API key is not set');
      await this.alignIndex(stockId);
      return;
    }

    try {
      // 주어진 주식방의 모든 사용자 목록을 가져옵니다.
      const allUsers = await this.getUserList(stockId);

      // 사용자 정보에서 userId와 소개글(introduction) 추출 (없을 경우 빈 문자열로 대체)
      const userData = allUsers.map((user) => ({
        gender: user.userInfo.gender,
        introduction: user.userInfo.introduction || '',
        nickname: user.userInfo.nickname,
      }));

      // OpenAI API에 전달할 프롬프트 작성
      const prompt = `다음 사용자들의 소개글을 확인하고, 친한 친구 혹은 연인이 될 수 있을 것 같은 사람들끼리 인접하도록 정렬해줘.
# 사용자 목록 schema
- gender: 사용자의 성별. 남성은 M, 여성은 F
- introduction: 사용자의 소개글
- nickname: 사용자의 닉네임
# 인접 기준 (우선순위 순)
0. **첫 번째 사용자는 반드시 남성으로 시작해야 한다**
1. 성별 교차 배치
   - 남녀 교차 배치를 최대한 유지
   - 성비 불균형 시 마지막에 다수 성별 배치
2. 나이대 매칭
   - 소개글에서 언급된 나이/나이대가 ±3세 이내인 사용자끼리 인접
   - 20대끼리, 30대끼리 등 비슷한 연령대로 그룹화
3. MBTI 성향 매칭
   - N은 N끼리, S는 S끼리 성향이 동일한 사용자를 우선 인접.
   - E/I, T/F, J/P도 고려하여 2개 이상 일치하는 경우 우선 배치
4. 공통 관심사/취미
   - 음악, 영화, 운동 등 공통 취미가 있는 경우 인접 배치
   - 투자 스타일이나 관심 종목이 유사한 경우 고려
5. 대화 스타일
   - 적극적/소극적 성향이 상호 보완되도록 배치
   - 말투나 대화 스타일이 유사한 사용자끼리 그룹화
6. 자기소개 너무 이상하게 적었으면 뒤로 배치시켜줘.
# 사용자 목록 schema
- gender: 사용자의 성별. 남성은 M, 여성은 F
- introduction: 사용자의 소개글
- nickname: 사용자의 닉네임
# 사용자 목록
${JSON.stringify(userData)}`;

      // OpenAI ChatCompletion API 호출
      const response = await this.openai.chat.completions.create({
        messages: [{ content: prompt, role: 'user' }],
        model: 'gpt-4o-mini',
        response_format: {
          json_schema: {
            name: 'nicknames',
            schema: {
              additionalProperties: false,
              properties: {
                nicknames: {
                  description: 'A nickname or a list of nicknames.',
                  items: {
                    description: 'A single nickname.',
                    type: 'string',
                  },
                  type: 'array',
                },
              },
              required: ['nicknames'],
              type: 'object',
            },
            strict: true,
          },
          type: 'json_schema',
        },
        temperature: 0.2,
        top_p: 0.1,
      });

      const { content } = response.choices[0].message;
      const sortedNicknames = JSON.parse(content).nicknames;

      if (sortedNicknames.length !== allUsers.length) {
        throw new Error('정렬된 닉네임 수가 사용자 수와 다릅니다.');
      }

      for (let i = 0; i < sortedNicknames.length; i++) {
        const userToUpdate = allUsers.find((u) => u.userInfo.nickname === sortedNicknames[i]);
        if (userToUpdate) {
          await this.userRepository.updateUser(stockId, userToUpdate.userId, { $set: { index: i } });
        }
      }
    } catch (e) {
      console.error(e);
      await this.alignIndex(stockId);
    }
  }

  async setIntroduce(stockId: string, userId: string, introduction: string): Promise<StockUser> {
    const updatedUser = await this.userRepository.updateUser(stockId, userId, {
      $set: { 'userInfo.introduction': introduction },
    });
    return updatedUser;
  }

  removeUser(stockId: string, userId: string): Promise<boolean> {
    try {
      return this.userRepository.removeUser(stockId, userId);
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async removeAllUser(
    stockId: string,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockUser>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    try {
      return this.userRepository.removeAllUsers(stockId);
    } catch (e: unknown) {
      console.error(e);
      throw e;
    }
  }

  async initializeUsers(
    stockId: string,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockUser>, 'lean'>,
  ): Promise<boolean> {
    console.debug('initializeUsers');
    try {
      return this.userRepository.initializeUsers(stockId);
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async startLoan(stockId: string, userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findUser(stockId, userId);
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 현재 매수 가능 금액이 100만원 미만인지 확인
      if (user.money >= StockConfig.BOUNDARY_LOAN_PRICE) {
        throw new HttpException('보유 금액이 100만원 이상인 경우 대출이 불가능합니다.', HttpStatus.BAD_REQUEST);
      }

      const stock = await this.stockRepository.findOneById(stockId);
      const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;

      const idx = Math.min(
        Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
        StockConfig.MAX_STOCK_IDX,
      );

      const allCompaniesPrice = user.stockStorages.reduce((acc, { companyName, stockCountCurrent }) => {
        const companyInfo = companies.get(companyName);
        const price = companyInfo[idx]?.가격;
        return acc + price * stockCountCurrent;
      }, 0);

      const estimatedAllMoney = allCompaniesPrice + user.money;

      // 매수 가능 금액 + 보유 주식 가치가 100만원 미만인 경우 대출 이 불가능합니다.
      if (estimatedAllMoney >= StockConfig.BOUNDARY_LOAN_PRICE) {
        throw new HttpException(
          '[매수 가능 금액 + 보유 주식 가치]가 100만원 이상인 경우 대출이 불가능합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 대출 실행
      const result = await this.stockRepository.updateOne(
        { _id: stockId, 'users.userId': userId },
        {
          $inc: {
            'users.$.loanCount': 1,
            'users.$.money': StockConfig.LOAN_PRICE, // 대출 횟수 증가
          },
        },
      );

      await session.commitTransaction();
      return { message: '대출이 성공적으로 실행되었습니다.', status: 201 };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async settleLoan(stockId: string, userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findUser(stockId, userId);
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 대출금 회수: 대출 횟수 * 200만원
      const loanAmount = user.loanCount * 2_000_000;
      const finalMoney = user.money - loanAmount;

      // 대출금 회수 및 대출 횟수 초기화
      await this.stockRepository.updateOne(
        { _id: stockId, 'users.userId': userId },
        {
          $set: {
            'users.$.loanCount': 0,
            'users.$.money': finalMoney,
          },
        },
      );

      await session.commitTransaction();
      return {
        data: { finalMoney },
        message: `대출금 ${loanAmount.toLocaleString()}원이 회수되었습니다.`,
        status: 200,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
