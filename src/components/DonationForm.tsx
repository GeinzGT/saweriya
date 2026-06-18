'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function DonationForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    message: '',
    mediaType: 'none',
    mediaUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/midtrans/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: function (result: any) {
            alert('Pembayaran berhasil! Terima kasih donasinya.');
            setFormData({ name: '', email: '', amount: '', message: '', mediaType: 'none', mediaUrl: '' });
          },
          onPending: function (result: any) {
            alert('Menunggu pembayaran.');
          },
          onError: function (result: any) {
            alert('Pembayaran gagal.');
          },
          onClose: function () {
            alert('Anda menutup popup pembayaran.');
          }
        });
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://app.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="lazyOnload" 
      />

      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Beri Dukungan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Nama kamu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Email kamu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              required
              min="1000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesan (Opsional)</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Pesan untuk streamer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Share</label>
            <select 
              name="mediaType" 
              value={formData.mediaType} 
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="none">Tidak ada</option>
              <option value="tts">TTS (Text to Speech pesan)</option>
              <option value="youtube">YouTube Video</option>
              <option value="tiktok">TikTok Video</option>
              <option value="custom_sound">Custom Sound URL</option>
            </select>
          </div>

          {formData.mediaType !== 'none' && formData.mediaType !== 'tts' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Media</label>
              <input 
                type="url" 
                name="mediaUrl" 
                value={formData.mediaUrl} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Masukkan URL..."
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Dukung Sekarang'}
          </button>
        </form>
      </div>
    </>
  );
}
