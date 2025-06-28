'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-normal text-gray-800 mb-2">Welcome to Modern ERP</h1>
          <p className="text-gray-600">Let's get you started with your ERP system</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>

        <Card className="bg-white shadow-sm p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium text-gray-800 mb-4">Getting Started</h2>
              
              <div className="space-y-4">
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Step 1: Create Your Company</h3>
                  <p className="text-gray-600 mb-4">
                    First, let's set up your company profile. This includes basic information, 
                    address details, and tax information.
                  </p>
                  <Button 
                    onClick={() => router.push('/company/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Company →
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg opacity-50">
                  <h3 className="text-lg font-medium mb-2">Step 2: Create Admin Account</h3>
                  <p className="text-gray-600">
                    After creating your company, you'll set up the administrator account.
                  </p>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg opacity-50">
                  <h3 className="text-lg font-medium mb-2">Step 3: Configure System</h3>
                  <p className="text-gray-600">
                    Finally, configure your system settings and preferences.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="bg-white p-6 text-center">
            <h3 className="font-medium mb-2">Already have a company?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Register a new user account
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/register')}
              className="w-full"
            >
              Register User
            </Button>
          </Card>

          <Card className="bg-white p-6 text-center">
            <h3 className="font-medium mb-2">Existing User?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign in to your account
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Sign In
            </Button>
          </Card>

          <Card className="bg-white p-6 text-center">
            <h3 className="font-medium mb-2">Test the System</h3>
            <p className="text-sm text-gray-600 mb-4">
              Check backend connectivity
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/test')}
              className="w-full"
            >
              Test Backend
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}