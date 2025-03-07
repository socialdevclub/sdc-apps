import * as COLOR from './color';

export const LEVEL_INFO = [
  {
    animal: 'hamster',
    color: COLOR.pastelGreen,
    label: '당돌한 햄스터',
    max: 0,
    min: Number.NEGATIVE_INFINITY,
    nextLabel: '토끼',
  },
  {
    animal: 'rabbit',
    color: COLOR.pastelGreen,
    label: '순수한 토끼',
    max: 100,
    min: 0,
    nextLabel: '고양이',
  },
  {
    animal: 'cat',
    color: COLOR.pastelGreen,
    label: '세심한 고양이',
    max: 150,
    min: 100,
    nextLabel: '강아지',
  },
  {
    animal: 'dog',
    color: COLOR.pastelGreen,
    label: '활발한 강아지',
    max: 200,
    min: 150,
    nextLabel: '늑대',
  },
  {
    animal: 'wolf',
    color: COLOR.pastelGreen,
    label: '도전적인 늑대',
    max: 250,
    min: 200,
    nextLabel: '호랑이',
  },
  {
    animal: 'tiger',
    color: COLOR.pastelGreen,
    label: '전략적인 호랑이',
    max: 300,
    min: 250,
    nextLabel: '드래곤',
  },
  {
    animal: 'dragon',
    color: COLOR.pastelGreen,
    label: '전설적인 드래곤',
    max: Number.POSITIVE_INFINITY,
    min: 300,
    nextLabel: '',
  },
];

export type LevelInfoType = (typeof LEVEL_INFO)[number];
