import React from 'react';
import CoordinateSelector from './CoordinateSelector';

function Controls({ 
  onPause, 
  onRestart, 
  onAngleChange,
  onAddPendulum,
  onDeletePendulum,
  onVerticalPositionChange,
  onToggleTrailEffect,
  onToggleDirectionalGravity,
  isPaused,
  verticalPosition,
  hasTrailEffect,
  hasDirectionalGravity,
  onLengthChange,
  currentLength,
  onToggleVacuum,
  isVacuum,
  onGravityStrengthChange,
  gravityStrength,
  onClear,
  theta1,
  theta2,
  pendulumAngles,
  position,
  onPositionChange
}) {
  // Helper function to format angle with fixed width
  const formatAngle = (radians) => {
    // Normalize angle to 0-2π range
    const normalized = ((radians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const degrees = (normalized * 180 / Math.PI).toFixed(1);
    const rads = normalized.toFixed(3);
    // Pad with spaces to maintain fixed width
    return `${degrees.padStart(6, ' ')}° (${rads.padStart(5, ' ')} rad)`;
  };

  const CircularSlider = ({ value, onChange, color, size = 80 }) => {
    const center = size / 2;
    const radius = (size / 2) - 10;
    
    // Convert value to coordinates on circle
    const getPointFromAngle = (angle) => {
      return {
        x: center + radius * Math.sin(angle),
        y: center - radius * Math.cos(angle)
      };
    };

    // Convert mouse position to angle
    const handleMouseMove = (event) => {
      if (event.buttons !== 1) return; // Only run while primary mouse button is pressed
      
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - center;
      const y = event.clientY - rect.top - center;
      const angle = Math.atan2(x, -y);
      const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
      onChange(normalizedAngle);
    };

    const point = getPointFromAngle(value);

    return (
      <svg 
        width={size} 
        height={size}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseMove}
        style={{ cursor: 'pointer' }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        
        {/* Arc showing current angle */}
        <path
          d={`
            M ${center} ${center}
            L ${center} ${center - radius}
            A ${radius} ${radius} 0 ${value > Math.PI ? 1 : 0} 1 ${point.x} ${point.y}
            L ${center} ${center}
          `}
          fill={color}
          fillOpacity="0.3"
        />
        
        {/* Line showing current angle */}
        <line
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Handle */}
        <circle
          cx={point.x}
          cy={point.y}
          r="6"
          fill={color}
        />
      </svg>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      right: '20px',
      top: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '20px',
      borderRadius: '12px',
      maxHeight: '90vh',  // Maximum height of 90% viewport height
      overflowY: 'auto',  // Enable vertical scrolling
      overflowX: 'hidden', // Prevent horizontal scrolling
      minWidth: '300px',   // Minimum width before scrolling
      maxWidth: '400px',   // Maximum width
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      // Custom scrollbar styling
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.3)'
        }
      }
    }}>
      {/* Control Buttons - Horizontal layout */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#4dabf7',  // Changed to blue color
            color: 'white',              // White text
            border: '1px solid #4dabf7',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            flex: 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px rgba(77, 171, 247, 0.1)',  // Blue glow
            minWidth: '100px',
            fontWeight: 'normal'
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(77, 171, 247, 0.2)'}
          onMouseLeave={e => e.target.style.boxShadow = '0 0 10px rgba(77, 171, 247, 0.1)'}
          onClick={onPause}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#4dabf7',  // Changed to blue color
            color: 'white',              // White text
            border: '1px solid #4dabf7',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            flex: 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px rgba(77, 171, 247, 0.1)',  // Blue glow
            minWidth: '100px',
            fontWeight: 'normal'
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(77, 171, 247, 0.2)'}
          onMouseLeave={e => e.target.style.boxShadow = '0 0 10px rgba(77, 171, 247, 0.1)'}
          onClick={onRestart}
        >
          Restart
        </button>
        <button 
          style={{ 
            padding: '8px 16px',
            backgroundColor: 'orange',  // Kept orange for Clear
            color: 'white',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            flex: 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 0 10px rgba(255, 107, 107, 0.1)',
            minWidth: '100px',
            fontWeight: 'normal'
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.2)'}
          onMouseLeave={e => e.target.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.1)'}
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ color: 'white' }}>Pendulum Length</label>
        <input 
          type="range" 
          min="0.05" 
          max="0.3" 
          step="0.01"
          value={currentLength}
          onChange={(e) => onLengthChange(parseFloat(e.target.value))}
        />
      </div>

      {/* Coordinate Selector */}
      <div style={{ width: '100%' }}>  {/* Full width container */}
        <label style={{ color: 'white', display: 'block', marginBottom: '10px' }}>
          Origin Position
        </label>
        <div style={{ display: 'flex', justifyContent: 'center' }}>  {/* Center the selector */}
          <CoordinateSelector
            width={200}
            height={150}
            position={position}
            onPositionChange={onPositionChange}
            style={{ width: '100%' }}  // Make selector fill width
          />
        </div>
      </div>

      {/* Theta 1 Controls - Side by side */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Red Theta 1 */}
        <div style={{ flex: 1 }}>
          <label style={{ color: '#ff6b6b' }}>Theta 1</label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CircularSlider
              value={pendulumAngles[1]?.t1 || 0}
              onChange={(value) => onAngleChange('theta1', value, 1)}
              color="#ff6b6b"
            />
            <div style={{ 
              color: '#ff6b6b', 
              width: '160px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {formatAngle(pendulumAngles[1]?.t1 || 0)}
            </div>
          </div>
        </div>

        {/* Blue Theta 1 */}
        <div style={{ flex: 1 }}>
          <label style={{ color: '#4dabf7' }}>Theta 1</label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CircularSlider
              value={pendulumAngles[0]?.t1 || 0}
              onChange={(value) => onAngleChange('theta1', value, 0)}
              color="#4dabf7"
            />
            <div style={{ 
              color: '#4dabf7', 
              width: '160px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {formatAngle(pendulumAngles[0]?.t1 || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Theta 2 Controls - Side by side */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Red Theta 2 */}
        <div style={{ flex: 1 }}>
          <label style={{ color: '#ff6b6b' }}>Theta 2</label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CircularSlider
              value={pendulumAngles[1]?.t2 || 0}
              onChange={(value) => onAngleChange('theta2', value, 1)}
              color="#ff6b6b"
            />
            <div style={{ 
              color: '#ff6b6b', 
              width: '160px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {formatAngle(pendulumAngles[1]?.t2 || 0)}
            </div>
          </div>
        </div>

        {/* Blue Theta 2 */}
        <div style={{ flex: 1 }}>
          <label style={{ color: '#4dabf7' }}>Theta 2</label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <CircularSlider
              value={pendulumAngles[0]?.t2 || 0}
              onChange={(value) => onAngleChange('theta2', value, 0)}
              color="#4dabf7"
            />
            <div style={{ 
              color: '#4dabf7', 
              width: '160px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              {formatAngle(pendulumAngles[0]?.t2 || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Vacuum/Gravity buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={onToggleVacuum}
          style={{
            backgroundColor: isVacuum ? '#4CAF50' : '#f44336',
            flex: 1,
            minWidth: '80px'
          }}
        >
          Vacuum
        </button>
        <button 
          onClick={onToggleVacuum}
          style={{
            backgroundColor: !isVacuum ? '#4CAF50' : '#f44336',
            flex: 1,
            minWidth: '80px'
          }}
        >
          Gravity
        </button>
        <button 
        onClick={onToggleDirectionalGravity}
        style={{
          backgroundColor: hasDirectionalGravity ? '#4CAF50' : '#f44336',
          opacity: isVacuum ? 0.5 : 1,
          cursor: isVacuum ? 'not-allowed' : 'pointer',
          minWidth: '120px',
          padding: '0.6em 0',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
        disabled={isVacuum}
      >
        {hasDirectionalGravity ? 'Freefall' : 'Freefall'}
      </button>
      </div>

      {/* Gravity strength slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ 
          color: isVacuum ? 'rgba(255, 255, 255, 0.5)' : 'white'  // Gray out text when in vacuum
        }}>
          Gravity Strength
        </label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1"
          value={gravityStrength}
          onChange={(e) => onGravityStrengthChange(parseFloat(e.target.value))}
          disabled={isVacuum}
          style={{ opacity: isVacuum ? 0.5 : 1 }}
        />
      </div>

      {/* Bottom row of buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px',
        marginTop: 'auto',  // Push to bottom
        borderTop: '1px solid #666',
        paddingTop: '10px'
      }}>
        <button 
          style={{ flex: 1, minWidth: '80px', padding: '0.6em 0', textAlign: 'center', backgroundColor: '#4CAF50' }}
          onClick={onAddPendulum}
        >
          Add
        </button>
        <button 
          style={{ flex: 1, minWidth: '80px', padding: '0.6em 0', textAlign: 'center', backgroundColor:'#f44336' }}
          onClick={onDeletePendulum}
        >
          Delete
        </button>
        <button 
          style={{
            flex: 1,
            minWidth: '80px',
            padding: '0.6em 0',
            textAlign: 'center',
            backgroundColor: hasTrailEffect ? '#4CAF50' : 'gray'
          }}
          onClick={onToggleTrailEffect}
        >
          Prism
        </button>
      </div>
    </div>
  );
}

export default Controls;

