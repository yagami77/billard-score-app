'use client';

import { useParams } from 'next/navigation';
import BillardScore from '../BillardScore'; // Ajustez le chemin si nécessaire

export default function TablePage() {

    console.log('Table page loaded with ID: 5');
    return <BillardScore initialTableId='5' />;
}