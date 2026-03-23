import React, { useState, useEffect } from 'react';

const Spinner = ({ path = "login" }) => {
  const [count, setCount] = useState(5);
  const [verticalCodes, setVerticalCodes] = useState([]);
  const [horizontalCodes, setHorizontalCodes] = useState([]);

  // Your original logic - unchanged
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    
    // Redirect to homepage when countdown reaches 0
    if (count === 0) {
      window.location.href = '/'; // Redirects to homepage
    }
    
    return () => clearInterval(interval);
  }, [count, path]);

  // Generate random number codes
  useEffect(() => {
    const generateRandomCode = () => {
      return Math.floor(Math.random() * 999999999999).toString();
    };

    const generateVerticalCodes = () => {
      const codes = [];
      for (let i = 0; i < 20; i++) {
        codes.push({
          id: i,
          value: generateRandomCode(),
          x: Math.random() * 100,
          animationDuration: Math.random() * 3 + 2, // 2-5 seconds
          delay: Math.random() * 2
        });
      }
      setVerticalCodes(codes);
    };

    const generateHorizontalCodes = () => {
      const codes = [];
      for (let i = 0; i < 15; i++) {
        codes.push({
          id: i,
          value: generateRandomCode(),
          y: Math.random() * 100,
          animationDuration: Math.random() * 4 + 3, // 3-7 seconds
          delay: Math.random() * 2
        });
      }
      setHorizontalCodes(codes);
    };

    generateVerticalCodes();
    generateHorizontalCodes();
    
    const verticalInterval = setInterval(generateVerticalCodes, 3000);
    const horizontalInterval = setInterval(generateHorizontalCodes, 4000);
    
    return () => {
      clearInterval(verticalInterval);
      clearInterval(horizontalInterval);
    };
  }, []);

  return (
    <div style={styles.container}>
      {/* Vertical Moving Codes */}
      <div style={styles.verticalCodesContainer}>
        {verticalCodes.map((code) => (
          <div 
            key={code.id}
            style={{
              ...styles.verticalCode,
              left: `${code.x}%`,
              animationDuration: `${code.animationDuration}s`,
              animationDelay: `${code.delay}s`
            }}
          >
            {code.value}
          </div>
        ))}
      </div>

      {/* Horizontal Moving Codes */}
      <div style={styles.horizontalCodesContainer}>
        {horizontalCodes.map((code) => (
          <div 
            key={code.id}
            style={{
              ...styles.horizontalCode,
              top: `${code.y}%`,
              animationDuration: `${code.animationDuration}s`,
              animationDelay: `${code.delay}s`
            }}
          >
            {code.value}
          </div>
        ))}
      </div>

      {/* Main Spinner Container */}
      <div style={styles.spinnerContainer}>
        {/* Outer Ring 1 */}
        <div style={styles.outerRing1}></div>
        
        {/* Outer Ring 2 */}
        <div style={styles.outerRing2}></div>
        
        {/* Outer Ring 3 */}
        <div style={styles.outerRing3}></div>
        
        {/* Middle Circle */}
        <div style={styles.middleCircle}>
          <div style={styles.innerRing1}></div>
          <div style={styles.innerRing2}></div>
          <div style={styles.innerRing3}></div>
          <div style={styles.innerRing4}></div>
          
          {/* Center Content */}
          <div style={styles.centerContent}>
            <div style={styles.countDisplay}>{count}</div>
          </div>
        </div>
      </div>

      {/* Text Content - Updated text */}
      <h1 style={styles.redirectText}>
        Redirecting to homepage in {count} second{count !== 1 ? 's' : ''}
      </h1>
      
      <div style={styles.loadingText}>Loading...</div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden'
  },

  verticalCodesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none'
  },

  horizontalCodesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none'
  },

  verticalCode: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    animation: 'moveVertical infinite linear',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    top: '-100px'
  },

  horizontalCode: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px',
    fontFamily: 'Courier New, monospace',
    animation: 'moveHorizontal infinite linear',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
    left: '-200px',
    whiteSpace: 'nowrap'
  },

  spinnerContainer: {
    position: 'relative',
    width: '300px',
    height: '300px',
    zIndex: 2,
    marginBottom: '30px'
  },

  // Outer Rings
  outerRing1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateClockwise 4s linear infinite',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
  },

  outerRing2: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    width: '270px',
    height: '270px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRight: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateCounterClockwise 3s linear infinite'
  },

  outerRing3: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    width: '240px',
    height: '240px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateClockwise 5s linear infinite'
  },

  // Middle Circle
  middleCircle: {
    position: 'absolute',
    top: '60px',
    left: '60px',
    width: '180px',
    height: '180px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: '50%',
    border: '3px solid #ffffff',
    boxShadow: 
      '0 0 30px rgba(255, 255, 255, 0.8), ' +
      'inset 0 0 30px rgba(255, 255, 255, 0.2)',
    animation: 'rotateClockwise 6s linear infinite'
  },

  // Inner Rings within Middle Circle
  innerRing1: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    width: '150px',
    height: '150px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateCounterClockwise 2s linear infinite'
  },

  innerRing2: {
    position: 'absolute',
    top: '25px',
    left: '25px',
    width: '130px',
    height: '130px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRight: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateClockwise 3s linear infinite'
  },

  innerRing3: {
    position: 'absolute',
    top: '35px',
    left: '35px',
    width: '110px',
    height: '110px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderLeft: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateCounterClockwise 2.5s linear infinite'
  },

  innerRing4: {
    position: 'absolute',
    top: '45px',
    left: '45px',
    width: '90px',
    height: '90px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderBottom: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'rotateClockwise 4s linear infinite'
  },

  // Center Content
  centerContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },

  countDisplay: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '0 0 20px #ffffff',
    animation: 'pulse 1s ease-in-out infinite alternate'
  },

  // Text Styles - keeping your original text
  redirectText: {
    fontSize: '24px',
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '0 0 10px #ffffff',
    zIndex: 2,
    margin: '20px 0',
    animation: 'textGlow 2s ease-in-out infinite alternate'
  },

  loadingText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    zIndex: 2,
    animation: 'blink 1.5s ease-in-out infinite'
  }
};

// CSS Animations
const AnimationStyles = () => (
  <style>
    {`
      @keyframes rotateClockwise {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes rotateCounterClockwise {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
      }

      @keyframes moveVertical {
        0% { transform: translateY(-100px) translateZ(0px); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.7; }
        100% { transform: translateY(calc(100vh + 100px)) translateZ(-200px); opacity: 0; }
      }

      @keyframes moveHorizontal {
        0% { transform: translateX(-200px) translateZ(0px); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateX(calc(100vw + 200px)) translateZ(-200px); opacity: 0; }
      }

      @keyframes textGlow {
        0% { text-shadow: 0 0 10px #ffffff; }
        100% { text-shadow: 0 0 20px #ffffff, 0 0 30px #ffffff; }
      }

      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
    `}
  </style>
);

const SpinnerWithAnimations = (props) => (
  <>
    <AnimationStyles />
    <Spinner {...props} />
  </>
);

export default SpinnerWithAnimations;