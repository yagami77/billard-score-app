'use client';
export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import OverlayContent from './OverlayContent';

export default function OverlayPage() {
    const searchParams = new URLSearchParams(window.location.search);
    const roomCode = searchParams.get('table') || 'default';

    console.log('[OverlayPage] Current roomCode:', roomCode);

    return (
        <Suspense fallback={<div>Chargement en cours...</div>}>
            <OverlayContent roomCode={roomCode} />
        </Suspense>
    );
}