import React, { useEffect, useRef, useState } from 'react';
import Controls from './Controls';

// Move Pendulum class outside the component
class Pendulum {
    constructor(t1, t2, color) {
        this.t1 = t1;
        this.t2 = t2;
        this.p1 = 0;
        this.p2 = 0;
        this.color = color;
        this.trails = [];
        this.trailColors = [];
        this.cycle = 0;
    }

    t1_dot(t1, t2, p1, p2, prefactor_t) {
        return prefactor_t * (2 * p1 - 3 * Math.cos(t1 - t2) * p2) / 
               (16 - 9 * Math.pow(Math.cos(t1 - t2), 2));
    }

    t2_dot(t1, t2, p1, p2, prefactor_t) {
        return prefactor_t * (8 * p2 - 3 * Math.cos(t1 - t2) * p1) / 
               (16 - 9 * Math.pow(Math.cos(t1 - t2), 2));
    }

    p1_dot(t1, t2, t1dot, t2dot, prefactor_p, constant) {
        return -prefactor_p * (t1dot * t2dot * Math.sin(t1 - t2) + 
               3 * constant * Math.sin(t1));
    }

    p2_dot(t1, t2, t1dot, t2dot, prefactor_p, constant) {
        return -prefactor_p * (-t1dot * t2dot * Math.sin(t1 - t2) + 
               constant * Math.sin(t2));
    }

    getQuadrantVector(x, y) {
        // Get center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Calculate direction from center
        const dirX = x - centerX;
        const dirY = y - centerY;
        
        // Normalize the vector and scale it
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        return {
            x: (dirX / length) * 2,  // Scale factor for x movement
            y: (dirY / length) * 2   // Scale factor for y movement
        };
    }

    update(dt, length, prefactor_t, prefactor_p, constant, verticalPosition, horizontalPosition) {
        let t1dot = this.t1_dot(this.t1, this.t2, this.p1, this.p2, prefactor_t);
        let t2dot = this.t2_dot(this.t1, this.t2, this.p1, this.p2, prefactor_t);
        let p1dot = this.p1_dot(this.t1, this.t2, t1dot, t2dot, prefactor_p, constant);
        let p2dot = this.p2_dot(this.t1, this.t2, t1dot, t2dot, prefactor_p, constant);

        this.t1 += dt * t1dot;
        this.t2 += dt * t2dot;
        this.p1 += dt * p1dot;
        this.p2 += dt * p2dot;

        const startY = window.innerHeight * verticalPosition;
        const startX = window.innerWidth * horizontalPosition;  // Add horizontal start position

        this.trails.push({
            x: startX + length * Math.sin(this.t1) + length * Math.sin(this.t2),  // Use startX instead of window.innerWidth/2
            y: startY + length * Math.cos(this.t1) + length * Math.cos(this.t2),
            xOffset: 0,
            yOffset: 0,
            cycle: this.cycle
        });
        this.trailColors.push(this.color);

        this.cycle = (this.cycle + 1) % 360;
    }

    render(context, length, radius, gravityStrength, verticalPosition, hasTrailEffect, hasDirectionalGravity, isVacuum, horizontalPosition, hidePendulumArms, isGravityReversed) {
        // Update trail positions with directional gravity
        this.trails.forEach((point, index) => {
            if (!isVacuum) {
                if (hasDirectionalGravity) {
                    const vector = this.getQuadrantVector(point.x, point.y);
                    // Reverse the vector if gravity is reversed
                    const gravityMultiplier = isGravityReversed ? -1 : 1;
                    point.xOffset = (point.xOffset || 0) + vector.x * gravityStrength * gravityMultiplier;
                    point.yOffset = (point.yOffset || 0) + vector.y * gravityStrength * gravityMultiplier;
                } else {
                    point.xOffset = point.xOffset || 0;
                    // Reverse vertical gravity if reversed
                    const gravityMultiplier = isGravityReversed ? -1 : 1;
                    point.yOffset = (point.yOffset || 0) + gravityStrength * gravityMultiplier;
                }
            }
            
            if (hasTrailEffect) {
                const hue = (this.cycle + index) % 360;
                this.trailColors[index] = `hsl(${hue}, 100%, 50%)`;
            } else {
                this.trailColors[index] = this.color;
            }
        });

        // Create segments of connected points that are all visible
        let segments = [];
        let currentSegment = [];
        
        this.trails.forEach((point, index) => {
            const x = point.x + (point.xOffset || 0);
            const y = point.y + (point.yOffset || 0);
            
            // Check if point is visible
            const isVisible = x >= -100 && 
                            x <= window.innerWidth + 100 && 
                            y >= -100 && 
                            y <= window.innerHeight + 100;
            
            if (isVisible) {
                currentSegment.push({
                    point: point,
                    index: index
                });
            } else if (currentSegment.length > 0) {
                // End current segment when hitting invisible point
                segments.push(currentSegment);
                currentSegment = [];
            }
        });
        
        // Add last segment if it exists
        if (currentSegment.length > 0) {
            segments.push(currentSegment);
        }

        // Draw each segment separately
        segments.forEach(segment => {
            if (segment.length < 2) return; // Need at least 2 points to draw a line
            
            context.lineWidth = 2;
            for (let i = 1; i < segment.length; i++) {
                const prev = segment[i - 1].point;
                const curr = segment[i].point;
                const colorIndex = segment[i].index;
                
                context.beginPath();
                context.strokeStyle = this.trailColors[colorIndex];
                context.moveTo(
                    prev.x + (prev.xOffset || 0),
                    prev.y + (prev.yOffset || 0)
                );
                context.lineTo(
                    curr.x + (curr.xOffset || 0),
                    curr.y + (curr.yOffset || 0)
                );
                context.stroke();
            }
        });

        // Only remove trails that are far outside the screen
        const buffer = 500; // Increased buffer zone
        this.trails = this.trails.filter((point, index) => {
            const x = point.x + (point.xOffset || 0);
            const y = point.y + (point.yOffset || 0);
            const keep = x >= -buffer && 
                        x <= window.innerWidth + buffer && 
                        y >= -buffer && 
                        y <= window.innerHeight + buffer;
            if (!keep) this.trailColors.splice(index, 1);
            return keep;
        });

        // Draw pendulum arms with both horizontal and vertical position
        const startY = window.innerHeight * verticalPosition;
        const startX = window.innerWidth * horizontalPosition;  // Use horizontal position
        context.strokeStyle = this.color;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(startX, startY);  // Start from the correct horizontal position
        let x1 = startX + length * Math.sin(this.t1);  // Calculate x1 from startX
        let y1 = startY + length * Math.cos(this.t1);
        let x2 = x1 + length * Math.sin(this.t2);
        let y2 = y1 + length * Math.cos(this.t2);
        context.lineTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        // Draw bobs (unchanged)
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(x1, y1, radius, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(x2, y2, radius, 0, 2 * Math.PI);
        context.fill();
    }
}

// Add this at the top of your component, outside of the function
const PENDULUM_COLORS = [
    "#0000ff", // blue
    "#ff0000", // red
    "#ffff00", // yellow
    "#ffa500", // orange
    "#800080", // purple
    "#008000", // green
];

function InfiniteSpiral() {
    const canvasRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [hasTrailEffect, setHasTrailEffect] = useState(false);
    const [hasDirectionalGravity, setHasDirectionalGravity] = useState(false);
    const [pendulumLength, setPendulumLength] = useState(0.1);
    const [isVacuum, setIsVacuum] = useState(false);
    const [gravityStrength, setGravityStrength] = useState(1);
    const [pendulumAngles, setPendulumAngles] = useState([
        { t1: Math.PI/3, t2: Math.PI/3 },     // Blue pendulum
        { t1: Math.PI/3 + 0.01, t2: Math.PI/3 }  // Red pendulum
    ]);
    const [hidePendulumArms, setHidePendulumArms] = useState(false);
    const [horizontalPosition, setHorizontalPosition] = useState(0.5);
    const [isTopLeft, setIsTopLeft] = useState(false);
    const [isGravityReversed, setIsGravityReversed] = useState(false);
    
    const pendulumsRef = useRef([
        new Pendulum(Math.PI/3, Math.PI/3, "#0000ff"),
        new Pendulum(Math.PI/3 + 0.01, Math.PI/3, "#ff0000")
    ]);

    // Add resize handler
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Add keyboard listener for both 'h' and 'j' keys
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key.toLowerCase() === 'h') {
                setHidePendulumArms(prev => !prev);
            }
            if (event.key.toLowerCase() === 'j') {
                setIsTopLeft(prev => !prev);
                // When toggling to top-left, set positions to 0
                if (!isTopLeft) {
                    setPosition({ x: 0, y: 0 });
                } else {
                    // When toggling back, reset to center
                    setPosition({ x: 0.5, y: 0.5 });
                }
            }
            if (event.key.toLowerCase() === 'k') {
                setIsGravityReversed(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isTopLeft]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const length = pendulumLength * canvas.width;
        const radius = 0.0075 * canvas.width;
        const mass = 1;
        const dt = 0.1;
        const prefactor_t = 6 / (mass * length * length);
        const prefactor_p = mass * length * length / 2;
        const constant = 9.81 / length;

        let animationFrameId;

        const animate = () => {
            if (!hasTrailEffect) {
                context.fillStyle = 'black';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            if (!isPaused) {
                pendulumsRef.current.forEach(pendulum => {
                    pendulum.update(dt, length, prefactor_t, prefactor_p, constant, 
                        position.y,
                        position.x
                    );
                });
            }

            pendulumsRef.current.forEach(pendulum => {
                pendulum.render(
                    context, 
                    length, 
                    hidePendulumArms ? 0 : radius,
                    gravityStrength,
                    position.y,
                    hasTrailEffect,
                    hasDirectionalGravity,
                    isVacuum,
                    position.x,
                    hidePendulumArms,
                    isGravityReversed
                );
            });

        

            // Update angle state to match current pendulum positions
            setPendulumAngles(pendulumsRef.current.map(pendulum => ({
                t1: pendulum.t1 || 0,  // Ensure we never pass undefined
                t2: pendulum.t2 || 0
            })));

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPaused, position.y, hasTrailEffect, 
        hasDirectionalGravity, pendulumLength, isVacuum, gravityStrength, 
        hidePendulumArms, isTopLeft, isGravityReversed]);

  
    // Control Handlers
    
    // Pause/Resume: Toggles the physics simulation
    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    // Restart: Resets pendulums to initial state
    const handleRestart = () => {
        pendulumsRef.current = [
            new Pendulum(Math.PI/3, Math.PI/3, PENDULUM_COLORS[0]),
            new Pendulum(Math.PI/3 + 0.01, Math.PI/3, PENDULUM_COLORS[1])
        ];
    };

    // Handle angle changes for specific pendulum
    const handleAngleChange = (angleType, value, pendulumIndex) => {
        console.log('Angle change:', angleType, value, pendulumIndex); // Debug log

        // Update the specific pendulum's angle
        const pendulum = pendulumsRef.current[pendulumIndex];
        if (pendulum) {
            if (angleType === 'theta1') pendulum.t1 = value;
            if (angleType === 'theta2') pendulum.t2 = value;
        }

        // Update state to reflect change
        setPendulumAngles(prev => prev.map((angles, idx) => 
            idx === pendulumIndex
                ? { ...angles, [angleType === 'theta1' ? 't1' : 't2']: value }
                : angles
        ));
    };

    // Add Pendulum: Creates a new pendulum with slightly randomized angles
    const handleAddPendulum = () => {
        const currentLength = pendulumsRef.current.length;
        const colorIndex = currentLength % PENDULUM_COLORS.length;
        const newPendulum = new Pendulum(
            Math.PI/3, 
            Math.PI/3, 
            PENDULUM_COLORS[colorIndex]
        );
        pendulumsRef.current.push(newPendulum);
    };

    // Delete Pendulum: Removes the last pendulum
    const handleDeletePendulum = () => {
        if (pendulumsRef.current.length > 2) {  // Keep at least 2 pendulums
            pendulumsRef.current = pendulumsRef.current.slice(0, -1);
        }
    };

    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
    };

    const handleToggleTrailEffect = () => {
        setHasTrailEffect(!hasTrailEffect);
    };

    const handleToggleDirectionalGravity = () => {
        setHasDirectionalGravity(!hasDirectionalGravity);
    };

    const handleLengthChange = (newLength) => {
        setPendulumLength(newLength);
    };

    const handleToggleVacuum = () => {
        setIsVacuum(!isVacuum);
    };

    const handleGravityStrengthChange = (newStrength) => {
        setGravityStrength(newStrength);
    };

    // Add clear handler
    const handleClear = () => {
        // Clear trails from all pendulums
        pendulumsRef.current.forEach(pendulum => {
            pendulum.trails = [];
            pendulum.trailColors = [];
        });
    };

    // Add handler for horizontal position
    const handleHorizontalPositionChange = (value) => {
        setHorizontalPosition(value);
    };

    return (
        <>
            <canvas 
                ref={canvasRef} 
                style={{
                    background: 'black',
                    position: 'fixed',
                    top: 0,
                    left: 0
                }}
            />
            <Controls 
                onPause={handlePause}
                onRestart={handleRestart}
                onAngleChange={handleAngleChange}
                onAddPendulum={handleAddPendulum}
                onDeletePendulum={handleDeletePendulum}
                onPositionChange={handlePositionChange}
                onToggleTrailEffect={handleToggleTrailEffect}
                onToggleDirectionalGravity={handleToggleDirectionalGravity}
                isPaused={isPaused}
                position={position}
                hasTrailEffect={hasTrailEffect}
                hasDirectionalGravity={hasDirectionalGravity}
                onLengthChange={handleLengthChange}
                currentLength={pendulumLength}
                onToggleVacuum={handleToggleVacuum}
                isVacuum={isVacuum}
                onGravityStrengthChange={handleGravityStrengthChange}
                gravityStrength={gravityStrength}
                onClear={handleClear}
                pendulumAngles={pendulumAngles}
                horizontalPosition={horizontalPosition}
                onHorizontalPositionChange={handleHorizontalPositionChange}
            />
        </>
    );
}
export default InfiniteSpiral;

