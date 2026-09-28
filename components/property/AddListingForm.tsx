"use client";

import React from 'react';
import { ListingStudio } from '@/components/dashboard/ListingStudio';

export function AddListingForm({ onComplete, editId }: { onComplete: () => void; editId?: string | null }) {
    return <ListingStudio onComplete={onComplete} editId={editId} />;
}

export default AddListingForm;
