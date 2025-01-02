'use client';
export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useState } from 'react';
import OverlayContent from './OverlayContent';

export default function OverlayPage() {
    const [roomCode, setRoomCode] = useState('default');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            setRoomCode(searchParams.get('table') || 'default');
        }
    }, []);

    console.log('[OverlayPage] Current roomCode:', roomCode);

    return (
        <Suspense fallback={<div>Chargement en cours...</div>}>
            <OverlayContent roomCode={roomCode} />
        </Suspense>
    );
}