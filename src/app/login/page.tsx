// src/app/login/page.tsx
import { redirect } from 'next/navigation';

export default function RootLoginPage() {
  redirect('/admin/login');
}
