import { redirect } from 'next/navigation';

export default function SearchPage({ searchParams }: { searchParams: any }) {
    const params = new URLSearchParams(searchParams);
    redirect('/rent?' + params.toString());
}