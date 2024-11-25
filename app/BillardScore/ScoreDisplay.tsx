// app/BillardScore/ScoreDisplay.tsx
import React from 'react';

interface ScoreDisplayProps {
    score: number;
    isActive: boolean;
}

const ScoreDisplay = ({ score, isActive }: ScoreDisplayProps) => {
    return (
        <div className="relative w-full">
            <div className={`
                text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 
                font-bold transition-all duration-300
                ${isActive ? 'text-blue-600 scale-110' : 'text-blue-900'}
                py-2 px-4
                flex justify-center items-center
            `}>
                {score}
            </div>
        </div>
    );
};

export default ScoreDisplay;