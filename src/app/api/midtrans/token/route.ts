import { NextResponse } from 'next/server';
import { snap } from '@/lib/midtrans';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, amount, message, mediaUrl, mediaType } = body;

    if (!name || !email || !amount) {
      return NextResponse.json(
        { error: 'Name, email and amount are required' },
        { status: 400 }
      );
    }

    const orderId = `SAWER-${uuidv4().substring(0, 8)}-${Date.now()}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        order_id: orderId,
        name,
        email,
        amount: parseInt(amount),
        message,
        media_type: mediaType,
        media_url: mediaUrl,
        status: 'pending'
      }
    });

    // Create Midtrans transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(amount)
      },
      customer_details: {
        first_name: name,
        email: email
      },
      item_details: [{
        id: 'SAWER',
        price: parseInt(amount),
        quantity: 1,
        name: 'Saweria Donation'
      }]
    };

    const snapToken = await snap.createTransaction(parameter);

    // Update with snap token
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { snap_token: snapToken.token }
    });

    return NextResponse.json({
      token: snapToken.token,
      orderId: orderId
    });

  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
