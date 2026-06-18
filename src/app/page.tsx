export const dynamic = 'force-dynamic';

import DonationForm from '@/components/DonationForm';
import Leaderboard from '@/components/Leaderboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Support My Stream!</h1>
          <p className="text-lg text-gray-600">Dukung kreator favoritmu dengan berdonasi.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <DonationForm />
          </div>
          <div>
            <Leaderboard />
          </div>
        </div>
      </div>
    </main>
  );
}
