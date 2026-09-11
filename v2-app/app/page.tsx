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
        <section className="hero bg-gradient-to-r from-primary to-secondary min-h-screen">
          <div className="hero-content text-center text-primary-content">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-6">Welcome to Infinithoughts</h1>
              <p className="text-lg mb-8">
                Discover and read amazing digital magazines in an interactive flipbook experience
              </p>
              {!session?.user ? (
                <div className="flex gap-4 justify-center">
                  <Link href="/auth/signin" className="btn btn-neutral">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <Link href="/dashboard" className="btn btn-neutral">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-base-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Articles Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2v-5.5a2 2 0 012-2H7m2 0a2 2 0 00-2 2v5.5a2 2 0 002 2m0 0V7m0 0a2 2 0 012-2h.5a2 2 0 012 2v5.5a2 2 0 01-2 2H9.5a2 2 0 01-2-2V7a2 2 0 012-2" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="card-title justify-center">Articles</h3>
                  <p className="text-center">Read articles from your favorite creators and publishers</p>
                </div>
              </div>

              {/* Magazines Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="card-title justify-center">Magazines</h3>
                  <p className="text-center">Browse curated digital magazines with beautiful flipbook layouts</p>
                </div>
              </div>

              {/* Community Card */}
              <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition">
                <div className="card-body">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3.25A1.25 1.25 0 012 19.75V4.25A1.25 1.25 0 013.25 3h17.5A1.25 1.25 0 0122 4.25v15.5A1.25 1.25 0 0120.75 21H15" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="card-title justify-center">Community</h3>
                  <p className="text-center">Connect with other readers and creators</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to explore?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of readers discovering amazing content on Infinithoughts
            </p>
            {!session?.user && (
              <div className="flex gap-4 justify-center">
                <Link href="/auth/signin" className="btn btn-outline">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
