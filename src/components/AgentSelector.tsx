'use client';

import React, { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  color: string;
  description: string;
}

interface AgentSelectorProps {
  selectedAgents: string[];
  onAgentToggle: (agentId: string) => void;
}

const agents: Agent[] = [
  {
    id: 'government',
    name: 'Government Official',
    avatar: 'G',
    color: 'bg-blue-500',
    description: 'Represents government perspective, focuses on policy feasibility and public interest'
  },
  {
    id: 'ngo',
    name: 'NGO Representative',
    avatar: 'N',
    color: 'bg-green-500',
    description: 'Focuses on social welfare and community issues'
  },
  {
    id: 'citizen',
    name: 'Citizen',
    avatar: 'C',
    color: 'bg-orange-500',
    description: 'Represents everyday people\'s perspectives and needs'
  },
  {
    id: 'student',
    name: 'University Student',
    avatar: 'S',
    color: 'bg-purple-500',
    description: 'Young person\'s perspective, focuses on innovation and future development'
  }
];

// 导出颜色映射
export const AGENT_COLORS: Record<string, string> = {
  government: 'bg-blue-500',
  ngo: 'bg-green-500',
  citizen: 'bg-orange-500',
  student: 'bg-purple-500'
};

export default function AgentSelector({ selectedAgents, onAgentToggle }: AgentSelectorProps) {
  return (
    <div className="w-1/4 flex flex-col p-4 bg-gray-50">
      <h3 className="text-sm font-bold text-[#5157E8] mb-4">Discussion Participants</h3>
      <div className="space-y-4">
        {agents.map((agent) => {
          const isSelected = selectedAgents.includes(agent.id);
          return (
            <div
              key={agent.id}
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                isSelected ? 'transform scale-105' : 'hover:transform hover:scale-102'
              }`}
              onClick={() => onAgentToggle(agent.id)}
            >
              <div
                className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center relative ${agent.color} ${
                  isSelected ? 'ring-2 ring-[#5157E8] ring-offset-2' : 'opacity-60'
                } transition-all duration-200`}
              >
                <span className="text-white text-xs font-medium">{agent.avatar}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5157E8] rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <span className={`text-xs text-center ${isSelected ? 'text-[#5157E8] font-medium' : 'text-gray-600'}`}>
                {agent.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {selectedAgents.length > 0 && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-[#5157E8] font-medium mb-2">
            {selectedAgents.length} role{selectedAgents.length > 1 ? 's' : ''} selected
          </div>
          <div className="text-xs text-gray-600">
            Selected roles will participate in the discussion, expressing views based on their respective positions
          </div>
        </div>
      )}
    </div>
  );
}
