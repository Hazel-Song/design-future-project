'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface WorkshopSection {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  path: string;
  image: string;
}

const sections: WorkshopSection[] = [
  {
    id: 1,
    key: 'signal',
    title: 'Signal',
    subtitle: '信号',
    path: '/future-signals',
    image: '/images/image_workshop/signal.png',
  },
  {
    id: 2,
    key: 'issue',
    title: 'Issue',
    subtitle: '议题',
    path: '/local-challenges',
    image: '/images/image_workshop/issue.png',
  },
  {
    id: 3,
    key: 'interpretation',
    title: 'Interpretation',
    subtitle: '诠释',
    path: '/interpretation',
    image: '/images/image_workshop/interpretation.png',
  },
  {
    id: 4,
    key: 'tomorrow_headline',
    title: 'Tomorrow Headline',
    subtitle: '明日头条',
    path: '/tomorrow-headlines',
    image: '/images/image_workshop/tomorrow_headline.png',
  },
];

export default function WorkshopPage() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const progress = JSON.parse(localStorage.getItem('workshopProgress') || '[]');
    setCompletedSteps(progress);
  }, []);

  if (!isClient) {
    return <div className="h-screen bg-white flex items-center justify-center text-gray-500">Loading...</div>;
  }
  
  const nextStepId = completedSteps.length + 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-6xl mx-auto pt-20">
        <div className="text-center mb-12 mt-0">
          <h1 className="text-4xl font-bold text-gray-800">Recommended Activities</h1>
          <p className="text-lg text-gray-500 mt-2">Following the step or Exploring the card you like!</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {sections.map((section) => {
            const isCompleted = completedSteps.includes(section.key);
            const isNextStep = section.id === nextStepId;
            const isLocked = !isCompleted && !isNextStep;

            const handleClick = () => {
              if (!isLocked) {
                router.push(section.path);
              }
            };

            return (
              <div
                key={section.id}
                onClick={handleClick}
                className={`
                  w-[260px] h-[440px] rounded-xl transition-all duration-300 flex flex-col
                  ${isLocked 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'bg-white cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1'
                  }
                  ${isNextStep ? 'border-2 border-[#5157E8]' : 'border-2 border-transparent'}
                `}
              >
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold shrink-0
                    ${isCompleted || isNextStep ? 'bg-[#5157E8] text-white' : 'bg-gray-300 text-gray-700'}
                  `}>
                    {section.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex-grow bg-gray-50 m-4 mt-0 rounded-md flex items-center justify-center">
                  <img 
                    src={section.image} 
                    alt={section.title} 
                    className={`max-h-[200px] max-w-[80%] w-auto h-auto object-contain transition-all duration-300
                      ${isLocked ? 'filter grayscale opacity-60' : ''}
                    `} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 