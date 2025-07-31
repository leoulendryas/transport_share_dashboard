import { NextResponse } from 'next/server';
import { User } from '@/types/user';

// Mock database
const users: User[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '+1 (555) 123-4567',
    created_at: '2023-05-15',
    email_verified: true,
    phone_verified: true,
    id_verified: true,
    banned: false,
    is_admin: false,
    is_driver: false,
  },
  // ... other users
];

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Handle different admin actions
  if (body.action === 'verify') {
    const user = users.find(u => u.id === body.userId);
    if (user) {
      user.id_verified = true;
      return NextResponse.json({ success: true });
    }
  }
  
  if (body.action === 'ban') {
    const user = users.find(u => u.id === body.userId);
    if (user) {
      user.banned = body.banned;
      return NextResponse.json({ success: true });
    }
  }
  
  if (body.action === 'reject') {
    const user = users.find(u => u.id === body.userId);
    if (user) {
      user.id_verified = false;
      user.id_image_url = undefined;
      return NextResponse.json({ success: true });
    }
  }
  
  return NextResponse.json({ success: false }, { status: 400 });
}