'use client';

import React from 'react';
import OverlayClient from './client';

export default function OverlayPage() {
    console.log('[OverlayPage] Rendered');

    return (
        <div>
            <OverlayClient />
        </div>
    );
}