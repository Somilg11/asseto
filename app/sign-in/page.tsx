import { SignIn } from '@stackframe/stack'
import Link from 'next/link'
import React from 'react'

const SignInPage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center'>
        <div>
            <SignIn />
            <div className='text-xs mt-3 font-medium'>
            <Link href="/"> &lt; Go Back Home</Link>
            </div>
        </div>
    </div>
  )
}

export default SignInPage