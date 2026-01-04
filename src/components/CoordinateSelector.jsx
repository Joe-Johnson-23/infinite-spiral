import React, { useRef, useEffect } from 'react';

const CoordinateSelector = ({ width = 200, height = 150, position, onPositionChange }) => {
    const selectorRef = useRef(null);
    const isDraggingRef = useRef(false);

    const updatePosition = (e) => {
        const rect = selectorRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        onPositionChange({ x, y });
    };

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        updatePosition(e);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        updatePosition(e);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <div
            ref={selectorRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                position: 'relative',
                cursor: 'crosshair',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            {/* Position indicator */}
            <div
                style={{
                    position: 'absolute',
                    left: `${position.x * 100}%`,
                    top: `${position.y * 100}%`,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                    pointerEvents: 'none'
                }}
            />
            {/* Grid lines */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '6px',
                background: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '25% 25%',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default CoordinateSelector;

