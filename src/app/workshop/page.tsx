'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface WorkshopSection {
  id: number;
  title: {
    en: string;
    zh: string;
  };
  subtitle: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  path: string;
  tags?: string[];
}

const sections: WorkshopSection[] = [
  {
    id: 1,
    title: {
      en: 'signal',
      zh: '信号'
    },
    subtitle: {
      en: 'Choose Future Signals',
      zh: '选择未来迹象'
    },
    description: {
      en: 'We have curated a rich collection of future signals for you to explore and choose from.',
      zh: '我们为您精心策划了丰富的未来信号集合供您探索和选择。'
    },
    path: '/future-signals',
    tags: ['Future Signal Library', 'STEEP']
  },
  {
    id: 2,
    title: {
      en: 'issue',
      zh: '议题'
    },
    subtitle: {
      en: 'Enter Local Challenges',
      zh: '输入地方挑战'
    },
    description: {
      en: 'You can input or select Local Challenges as the background for subsequent analysis.',
      zh: '您可以输入或选择地方性挑战作为后续分析的背景。'
    },
    path: '/local-challenges',
    tags: ['Local Challenges Library']
  },
  {
    id: 3,
    title: {
      en: 'interpretation',
      zh: '诠释'
    },
    subtitle: {
      en: 'Build Future Interpretations',
      zh: '构建未来诠释'
    },
    description: {
      en: 'AI will assist you in generating Future Interpretations and Provotyping Cards, clarifying the logic of future evolution.',
      zh: 'AI将协助您生成未来解释和原型卡片，阐明未来演化的逻辑。'
    },
    path: '/interpretation',
    tags: ['Provotyping Card', 'Interpretation Canvas', '"A will B+ because C"']
  },
  {
    id: 4,
    title: {
      en: 'tomorrow headline',
      zh: '明日头条'
    },
    subtitle: {
      en: "Generate Tomorrow Headline",
      zh: '生成明日头条'
    },
    description: {
      en: 'Based on the above analysis, AI will generate headlines for tomorrow.',
      zh: '基于以上分析，AI将生成明日头条。'
    },
    path: '/tomorrow-headlines',
    tags: ['Tomorrow Headline', 'Backcasting']
  }
];

export default function WorkshopPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
      router.push('/log_in');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="workshop-container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Aizu Future Workshop</h1>
          <h2 className="text-2xl text-gray-600">会津未来工作坊</h2>
        </div>
        
        <div className="cards-container">
          {sections.map((section) => (
            <Link 
              key={section.id}
              href={section.path}
              className="workshop-card block"
            >
              <div className="card-content">
                <div className="header-container">
                  <div className="section-number">{section.id}</div>
                  <div className="section-title">
                    <div className="section-title-en">{section.title.en}</div>
                    <div className="section-title-zh">{section.title.zh}</div>
                  </div>
                </div>
                <div className="section-info">
                  <div className="section-info-title">
                    <div className="subtitle-en">{section.subtitle.en}</div>
                    <div className="subtitle-zh">{section.subtitle.zh}</div>
                  </div>
                  <div className="section-info-description">
                    <div>{section.description.en}</div>
                    <div>{section.description.zh}</div>
                  </div>
                  {section.tags && (
                    <div className="tag-container">
                      {section.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 