'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/header'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 3.665c1.016-.609 2.283-.789 3.476-.331.826.3 1.497.975 1.926 1.854.429.879.715 2.056.897 3.456.182-1.4.468-2.577.897-3.456.429-.879 1.1-1.554 1.926-1.854 1.193-.458 2.46-.278 3.476.331.68.409 1.276 1.138 1.797 2.063.521.925.933 2.183 1.19 3.723.258-1.54.67-2.798 1.191-3.723.521-.925 1.117-1.654 1.797-2.063M3 20.354a9 9 0 0 1 1.8-2.901c.857-.989 1.743-1.638 2.592-1.900.85-.263 1.542-.115 2.063.248.52.364.818 1.08.818 2.276 0 .888-.154 1.751-.515 2.588M21 20.354c-.857-.989-1.743-1.638-2.592-1.9-.85-.263-1.542-.115-2.063.248-.52.364-.818 1.08-.818 2.276 0 .888.154 1.751.515 2.588" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-4 text-gray-900">
              Authentication Error
            </h1>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center">
                {error || 'An authentication error occurred. Please try again.'}
              </p>
            </div>

            <Link
              href="/auth/signin"
              className="w-full block text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Sign In
            </Link>

            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
