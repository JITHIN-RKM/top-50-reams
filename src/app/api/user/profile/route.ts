import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRollNumberRequired } from '@/lib/constants';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, roll_number, branch, year, phone_country_code, phone_number, gender, role, onboarding_complete, team_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      roll_number,
      branch,
      year,
      phone_country_code = '+91',
      phone_number,
      gender,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!branch || !branch.trim()) {
      return NextResponse.json({ error: 'Branch / Department is required' }, { status: 400 });
    }
    if (!year || !year.trim()) {
      return NextResponse.json({ error: 'Year / Role is required' }, { status: 400 });
    }
    if (!gender || !gender.trim()) {
      return NextResponse.json({ error: 'Gender is required' }, { status: 400 });
    }
    if (!phone_number || !phone_number.trim() || phone_number.trim().length < 7) {
      return NextResponse.json({ error: 'A valid phone number (at least 7 digits) is required' }, { status: 400 });
    }

    // Dynamic roll number check
    if (isRollNumberRequired(year) && (!roll_number || !roll_number.trim())) {
      return NextResponse.json({ error: `Roll number is mandatory for ${year}` }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        full_name: full_name.trim(),
        roll_number: roll_number?.trim() || null,
        branch: branch.trim(),
        year: year.trim(),
        phone_country_code: phone_country_code.trim() || '+91',
        phone_number: phone_number.trim(),
        gender: gender.trim(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
