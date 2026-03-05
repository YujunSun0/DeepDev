'use client';

import { SiJavascript, SiReact } from 'react-icons/si';
import { HiOutlineAcademicCap, HiOutlineCircleStack, HiOutlineServerStack } from 'react-icons/hi2';

interface Domain {
  id: string;
  name: string;
  available: boolean;
  icon: React.ReactNode;
  iconColor: string;
}

const domains: Domain[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    available: true,
    icon: <SiJavascript className="h-4 w-4" />,
    iconColor: 'text-yellow-400',
  },
  {
    id: 'dsa',
    name: '자료구조 & 알고리즘',
    available: true,
    icon: <HiOutlineAcademicCap className="h-4 w-4" />,
    iconColor: 'text-blue-400',
  },
  {
    id: 'os-network',
    name: 'OS & 네트워크',
    available: true,
    icon: <HiOutlineServerStack className="h-4 w-4" />,
    iconColor: 'text-green-400',
  },
  {
    id: 'database',
    name: '데이터베이스',
    available: false,
    icon: <HiOutlineCircleStack className="h-4 w-4" />,
    iconColor: 'text-emerald-400',
  },
  {
    id: 'react',
    name: 'React',
    available: false,
    icon: <SiReact className="h-4 w-4" />,
    iconColor: 'text-cyan-400',
  },
];

interface DomainTabsProps {
  activeId: string;
  onChange: (id: string) => void;
}

export function DomainTabs({ activeId, onChange }: DomainTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {domains.map((d) => (
        <button
          key={d.id}
          onClick={() => d.available && onChange(d.id)}
          disabled={!d.available}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeId === d.id
              ? 'bg-primary-500 text-white shadow-sm'
              : d.available
                ? 'bg-white text-gray-600 hover:bg-gray-50'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
        >
          <span className={activeId === d.id ? 'text-white' : d.available ? d.iconColor : 'text-gray-300'}>
            {d.icon}
          </span>
          {d.name}
          {!d.available && (
            <span className="ml-0.5 text-[10px] text-gray-300">곧 출시</span>
          )}
        </button>
      ))}
    </div>
  );
}
