'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Header from '@/app/components/header'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {session.user.name || session.user.email}!
            </h1>
            <p className="text-xl text-gray-600">
              Manage your account and explore content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{session.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">{session.user.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 capitalize">{(session.user as any).role || 'user'}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/articles"
                  className="block px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Browse Articles
                </Link>
                <Link
                  href="/magazines"
                  className="block px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition text-center"
                >
                  Browse Magazines
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition text-center"
                >
                  Account Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Creator Actions */}
          {(session.user as any).role === 'creator' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Creator Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/creator/articles/new"
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-center"
                >
                  Publish Article
                </Link>
                <Link
                  href="/creator/magazines/upload"
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-center"
                >
                  Upload Magazine
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
