'use client'

import Header from './components/header'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white mb-4">
                Welcome to Infinithoughts
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover and read amazing digital magazines
              </p>
              {!session?.user ? (
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/auth/signin"
                    className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Articles */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2v-5.5a2 2 0 012-2H7m2 0a2 2 0 00-2 2v5.5a2 2 0 002 2m0 0V7m0 0a2 2 0 012-2h.5a2 2 0 012 2v5.5a2 2 0 01-2 2H9.5a2 2 0 01-2-2V7a2 2 0 012-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Articles</h3>
                <p className="text-gray-600">
                  Read articles from your favorite creators and publishers
                </p>
              </div>

              {/* Magazines */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Magazines</h3>
                <p className="text-gray-600">
                  Browse curated digital magazines with beautiful layouts
                </p>
              </div>

              {/* Community */}
              <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3.25A1.25 1.25 0 012 19.75V4.25A1.25 1.25 0 013.25 3h17.5A1.25 1.25 0 0122 4.25v15.5A1.25 1.25 0 0120.75 21H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Community</h3>
                <p className="text-gray-600">
                  Connect with other readers and creators
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
