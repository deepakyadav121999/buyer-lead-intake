'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Users, Plus, Upload, Download, LogOut, User, Menu, X, Home, BarChart3, Settings } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!session) {
    return null;
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'All Leads', href: '/buyers', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Buyer Leads</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 group ${
                pathname === item.href || (item.href === '/' && pathname === '/buyers')
                  ? 'text-white bg-white/20 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/buyers/new"
              className="flex items-center space-x-3 px-4 py-3 mb-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Lead</span>
            </Link>
            
            <Link
              href="/buyers/import"
              className="flex items-center space-x-3 px-4 py-3 mb-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Import CSV</span>
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{session.user?.name || session.user?.email}</p>
                <p className="text-xs text-white/60">Admin User</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 px-4 py-3 w-full text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Buyer Leads
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Lead Management System</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    pathname === item.href || (item.href === '/' && pathname === '/buyers')
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/buyers/new"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>New Lead</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.user?.name || session.user?.email}</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Buyer Leads</span>
          </Link>
          
          <Link
            href="/buyers/new"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </>
  );
}