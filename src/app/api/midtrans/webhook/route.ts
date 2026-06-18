export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hash = crypto.createHash('sha512').update(body.order_id + body.status_code + body.gross_amount + serverKey).digest('hex');
    
    if (hash !== body.signature_key) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const { order_id, transaction_status, payment_type } = body;

    // Update transaction status
    let status = 'pending';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      status = 'settlement';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      status = 'cancel';
    }

    const transaction = await prisma.transaction.update({
      where: { order_id },
      data: { 
        status,
        payment_type
      }
    });

    if (status === 'settlement') {
      // Update leaderboard
      const existing = await prisma.leaderboard.findFirst({
        where: { name: transaction.name }
      });

      if (existing) {
        await prisma.leaderboard.update({
          where: { id: existing.id },
          data: { amount: existing.amount + transaction.amount }
        });
      } else {
        await prisma.leaderboard.create({
          data: {
            name: transaction.name,
            amount: transaction.amount
          }
        });
      }

      // Trigger pusher event for overlay
      await pusherServer.trigger('sawer-channel', 'donation', {
        name: transaction.name,
        amount: transaction.amount,
        message: transaction.message,
        mediaType: transaction.media_type,
        mediaUrl: transaction.media_url
      });
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
