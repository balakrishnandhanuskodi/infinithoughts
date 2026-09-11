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
      <div className="min-h-screen bg-gradient-to-br from-error/10 to-warning/10 flex items-center justify-center py-12 px-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 3.665c1.016-.609 2.283-.789 3.476-.331.826.3 1.497.975 1.926 1.854.429.879.715 2.056.897 3.456.182-1.4.468-2.577.897-3.456.429-.879 1.1-1.554 1.926-1.854 1.193-.458 2.46-.278 3.476.331.68.409 1.276 1.138 1.797 2.063.521.925.933 2.183 1.19 3.723.258-1.54.67-2.798 1.191-3.723.521-.925 1.117-1.654 1.797-2.063M3 20.354a9 9 0 0 1 1.8-2.901c.857-.989 1.743-1.638 2.592-1.900.85-.263 1.542-.115 2.063.248.52.364.818 1.08.818 2.276 0 .888-.154 1.751-.515 2.588M21 20.354c-.857-.989-1.743-1.638-2.592-1.9-.85-.263-1.542-.115-2.063.248-.52.364-.818 1.08-.818 2.276 0 .888.154 1.751.515 2.588" />
                </svg>
              </div>
            </div>

            <h1 className="card-title justify-center text-3xl mb-4">Authentication Error</h1>

            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m-2-2l-2 2" />
              </svg>
              <span className="text-sm">
                {error || 'An authentication error occurred. Please try again.'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/auth/signin" className="btn btn-primary">
                Back to Sign In
              </Link>
              <Link href="/" className="btn btn-ghost">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
