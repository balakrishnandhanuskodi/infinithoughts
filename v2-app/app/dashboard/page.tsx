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
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4">Loading...</p>
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
      <main className="min-h-screen bg-base-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Welcome back, {session.user.name || session.user.email}!
            </h1>
            <p className="text-xl opacity-75">
              Manage your account and explore content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Profile Card */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm opacity-75">Email</p>
                    <p className="font-semibold">{session.user.email}</p>
                  </div>
                  <div className="divider my-2"></div>
                  <div>
                    <p className="text-sm opacity-75">Full Name</p>
                    <p className="font-semibold">{session.user.name || 'Not set'}</p>
                  </div>
                  <div className="divider my-2"></div>
                  <div>
                    <p className="text-sm opacity-75">Role</p>
                    <div className="badge badge-primary capitalize mt-2">
                      {(session.user as any).role || 'user'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/articles" className="btn btn-primary">
                    Browse Articles
                  </Link>
                  <Link href="/magazines" className="btn btn-secondary">
                    Browse Magazines
                  </Link>
                  <Link href="/settings" className="btn btn-ghost">
                    Account Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Creator Actions */}
          {(session.user as any).role === 'creator' && (
            <div className="card bg-gradient-to-r from-primary/20 to-secondary/20 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Creator Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/creator/articles/new" className="btn btn-success">
                    Publish Article
                  </Link>
                  <Link href="/creator/magazines/upload" className="btn btn-info">
                    Upload Magazine
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
