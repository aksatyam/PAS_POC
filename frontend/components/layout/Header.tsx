'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Bell, Search, Activity } from 'lucide-react';
import ActivityFeed from '@/components/activity/ActivityFeed';

export default function Header() {
  const { user } = useAuth();
  const [showActivity, setShowActivity] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search policies, customers, claims..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowActivity(!showActivity)}
            className={`relative p-2 rounded-lg transition-colors ${showActivity ? 'text-accent-600 bg-accent-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title="Activity Feed">
            <Activity size={20} />
          </button>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center text-sm font-medium">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </header>
      <ActivityFeed isOpen={showActivity} onClose={() => setShowActivity(false)} />
    </>
  );
}
