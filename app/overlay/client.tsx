'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import OverlayContent from './OverlayContent';

export default function OverlayClient() {
    const searchParams = useSearchParams();
    const roomCode = searchParams.get('table') || 'default';

    console.log('[OverlayClient] Current roomCode:', roomCode);

    return (
        <div>
            <OverlayContent roomCode={roomCode} />
        </div>
    );
}