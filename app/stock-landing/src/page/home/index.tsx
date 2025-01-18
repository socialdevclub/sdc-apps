/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { Style } from './index.style';

const features = [
  '소셜게임 혜택으로 재미와 성장을 동시에 누리세요.',
  '나만의 소셜게임 제작으로 창의력을 발휘하세요.',
  '함께하는 네트워킹으로 새로운 인사이트를 얻으세요.',
  '커뮤니티 속에서 협업과 성장의 기회를 만드세요.',
];

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Style.Container>
      <Style.Header>
        <Style.Title>
          소셜 데브 클럽 <span>소데클</span>
        </Style.Title>
        <Style.Subtitle>게임을 통해 사람들과 연결되고 함께 성장하는 특별한 경험을 제공합니다.</Style.Subtitle>
        <Style.Button onClick={() => window.open('https://discord.gg/H8sq77NabR', '_blank')}>
          디스코드로 가입하기
        </Style.Button>
      </Style.Header>

      <Style.FeatureBox>
        <Style.FeatureText key={currentFeature}>{features[currentFeature]}</Style.FeatureText>
      </Style.FeatureBox>
    </Style.Container>
  );
};

export default Home;
