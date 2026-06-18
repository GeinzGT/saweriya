export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';

async function getLeaderboard() {
  return await prisma.leaderboard.findMany({
    orderBy: { amount: 'desc' },
    take: 10
  });
}

export default async function Leaderboard() {
  const leaderboard = await getLeaderboard();

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow border border-gray-100 mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">🏆 Leaderboard</h2>
      
      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Belum ada donasi.</p>
      ) : (
        <ul className="space-y-3">
          {leaderboard.map((item, index) => (
            <li key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`font-bold ${index === 0 ? 'text-yellow-500 text-xl' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                  #{index + 1}
                </span>
                <span className="font-semibold text-gray-800">{item.name}</span>
              </div>
              <span className="font-bold text-green-600">
                Rp {item.amount.toLocaleString('id-ID')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
