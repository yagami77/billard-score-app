'use client';

import { useParams } from 'next/navigation';
import BillardScore from '../BillardScore'; // Ajustez le chemin si nécessaire

export default function TablePage() {

    console.log('Table page loaded with ID: 4');
    return <BillardScore initialTableId='4' />;
}