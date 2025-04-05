'use client';

import React, { Suspense } from 'react';
import OverlayClient from './client';

export default function Page() {
    return (
        <Suspense fallback={<div>Chargement en cours...</div>}>
            <OverlayClient />
        </Suspense>
    );
}