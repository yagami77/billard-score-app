'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const OverlayClient = dynamic(() => import('./client'), {
    loading: () => (
        <div className="p-4 text-white bg-black/50 rounded">
            <div>Chargement...</div>
        </div>
    )
});

export default function OverlayPage() {
    return (
        <Suspense fallback={null}>
            <OverlayClient />
        </Suspense>
    );
}