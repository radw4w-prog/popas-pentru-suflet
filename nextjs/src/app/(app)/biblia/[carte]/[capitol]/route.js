import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';

export async function GET(request, { params }) {
  try {
    const { carte, capitol } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '500';

    const response = await axios.get(`${API_URL}/api/verses`, {
      params: {
        carte,
        capitol: parseInt(capitol),
        page,
        limit: parseInt(limit)
      },
      timeout: 10000
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Bible API error:', error.message);
    return NextResponse.json(
      { error: 'Nu s-au putut încărca versetele', details: error.message },
      { status: 500 }
    );
  }
}