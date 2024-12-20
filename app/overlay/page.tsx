import { Suspense } from 'react';
import OverlayClient from './client';

export default function OverlayPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OverlayClient />
        </Suspense>
    );
}