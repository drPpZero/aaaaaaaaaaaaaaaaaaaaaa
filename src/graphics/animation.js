let globalXPos = 0.0, globalJumpHeight = 0.0, globalSpinAngle = 0.0;  
let torsoLean = 0.0, torsoTwist = 0.0, torsoRoll = 0.0, headAngle = 0.0;
let lShoulderLift = 0.0, rShoulderLift = 0.0, lShoulderSwing = 0.0, rShoulderSwing = 0.0, lShoulderTwist = 0.0, rShoulderTwist = 0.0;
let lElbowAngle = 0.0, rElbowAngle = 0.0;
let lHipAngle = 0.0, rHipAngle = 0.0, lHipRoll = 0.0, rHipRoll = 0.0;        
let lKneeAngle = 0.0, rKneeAngle = 0.0, lAnkleAngle = 0.0, rAnkleAngle = 0.0; 

let prevPose = null;
let blendTime = 0.0;
const BLEND_DURATION = 0.4; 
let lastMode = null;
let currentRenderState = capturePose();

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
function easeInQuad(t) { return t * t; }
function lerpSpin(start, end, mix) {
  let diff = end - start;
  diff = ((diff + 180) % 360 + 360) % 360 - 180;
  return start + diff * mix;
}

function capturePose() {
  return {
    gX: globalXPos, gY: globalJumpHeight, gSpin: globalSpinAngle,
    tLean: torsoLean, tTwist: torsoTwist, tRoll: torsoRoll, head: headAngle,
    lSLift: lShoulderLift, rSLift: rShoulderLift, lSSwing: lShoulderSwing, rSSwing: rShoulderSwing, lSTwist: lShoulderTwist, rSTwist: rShoulderTwist,
    lElbow: lElbowAngle, rElbow: rElbowAngle,
    lHip: lHipAngle, rHip: rHipAngle, lHipR: lHipRoll, rHipR: rHipRoll,
    lKnee: lKneeAngle, rKnee: rKneeAngle, lAnkle: lAnkleAngle, rAnkle: rAnkleAngle
  };
}

export function getUpdatedRenderState(mode, t) {
  if (lastMode !== mode) {
    prevPose = capturePose();
    blendTime = BLEND_DURATION;
    lastMode = mode;
  }

  globalXPos = 0; globalJumpHeight = 0; globalSpinAngle = 0;
  torsoLean = 0; torsoTwist = 0; torsoRoll = 0; headAngle = 0;
  lShoulderLift = 0; rShoulderLift = 0; lShoulderSwing = 0; rShoulderSwing = 0; lShoulderTwist = 0; rShoulderTwist = 0;
  lElbowAngle = 0; rElbowAngle = 0;
  lHipAngle = 0; rHipAngle = 0; lHipRoll = 0; rHipRoll = 0;
  lKneeAngle = 0; rKneeAngle = 0; lAnkleAngle = 0; rAnkleAngle = 0;

  if (mode === "sideStep") {
    const freq = 1.2;
    const cycle = t * freq * Math.PI;
    torsoRoll = Math.sin(cycle) * 12;
    torsoLean = 8 + Math.cos(cycle * 2) * 2;
    globalJumpHeight = Math.abs(Math.cos(cycle)) * 0.1;
    lHipAngle = Math.sin(cycle) * 25;
    rHipAngle = Math.sin(cycle + Math.PI) * 25;
    lHipRoll = Math.cos(cycle) * 5;
    rHipRoll = Math.cos(cycle + Math.PI) * 5;
    lKneeAngle = lHipAngle < 0 ? -lHipAngle * 0.8 : 0;
    rKneeAngle = rHipAngle < 0 ? -rHipAngle * 0.8 : 0;
    lShoulderLift = -20; rShoulderLift = -20;
    lShoulderSwing = 20; rShoulderSwing = 20;
    lElbowAngle = -10; rElbowAngle = -10;
    headAngle = -torsoRoll * 0.5;


  } else if (mode === "toeLoop") {
    const duration = 1.5;
    const p = (t % duration) / duration;
    
    if (p < 0.15) {
      const eased = easeInOutSine(p / 0.15);
      
      globalJumpHeight = lerp(0, -0.4, eased); 
      rKneeAngle = eased * 50; 
      lHipAngle = eased * -40; 
      lKneeAngle = eased * 10; 
      
      torsoLean = eased * 15;
      torsoTwist = eased * -40; 
      
      lShoulderLift = rShoulderLift = eased * 45; 
      lShoulderSwing = eased * 30; 
      rShoulderSwing = eased * -30; 
      
    } else if (p < 0.3) {
      const eased = easeInQuad((p - 0.15) / 0.15);
      
      globalJumpHeight = lerp(-0.4, 0.2, eased);
      rKneeAngle = lerp(50, 0, eased); 
      lHipAngle = lerp(-40, 0, eased); 
      torsoTwist = lerp(-40, 0, eased); 
      
    } else if (p < 0.8) {
      const pFlight = (p - 0.3) / 0.5; 
      const arc = Math.sin(pFlight * Math.PI);
      
      globalJumpHeight = 0.2 + arc * 3.5; 
      globalSpinAngle = pFlight * 360; 
      
      lShoulderLift = rShoulderLift = 5;
      lElbowAngle = rElbowAngle = -130; 
      lHipAngle = rHipAngle = 0; 
      lKneeAngle = rKneeAngle = 0;
      
    } else {
      const pLand = (p - 0.8) / 0.2;
      const eased = easeOutQuad(pLand);
      
      globalJumpHeight = lerp(0.2, 0, eased);
      globalSpinAngle = 360; 
      
      const impact = 1 - eased; 
      
      rKneeAngle = impact * 50; 
      lHipAngle = impact * -45; 
      torsoLean = impact * 20; 
      
      lShoulderLift = rShoulderLift = eased * 85; 
      lShoulderSwing = eased * -20; 
      rShoulderSwing = eased * 20;
    }


  } else if (mode === "splitJump") {
    const duration = 2.0;
    const p = (t % duration) / duration;
    if (p < 0.3) {
      const eased = easeInQuad(p / 0.3);
      globalJumpHeight = -eased * 0.4;
      lKneeAngle = rKneeAngle = eased * 20;
    } else if (p < 0.7) {
      const pJump = (p - 0.3) / 0.4;
      const arc = Math.sin(pJump * Math.PI);
      globalJumpHeight = -0.4 + arc * 3.0;
      const splitPower = Math.pow(arc, 0.5);
      lHipAngle = splitPower * 100;
      rHipAngle = splitPower * -100;
      torsoTwist = easeInQuad(p / 0.7) * 180;
      lShoulderLift = rShoulderLift = splitPower * 95;
    } else {
      const pLand = (p - 0.7) / 0.3;
      const eased = easeOutQuad(pLand);
      torsoTwist = -180 + easeInQuad(p / 1) * 180;
      lShoulderLift = rShoulderLift = lerp(95, 30, eased);
    }


  } else if (mode === "uprightSpin") {
    const duration = 3.0;
    const p = (t % duration) / duration;
    const totalRotations = 4; 
    globalSpinAngle = ((-Math.cos(p * Math.PI) + 1) / 2) * totalRotations * 360;
    if (p < 0.2) {
      lShoulderLift = rShoulderLift = 80;
      lHipRoll = 10;
      rHipAngle = -60;
      rHipRoll = 30;
      rKneeAngle = 20;
      lAnkleAngle = 30;
    } else if (p < 0.8) {
      const pIn = (p - 0.2) / 0.6;
      const pull = easeInOutSine(pIn);
      lShoulderLift = rShoulderLift = lerp(80, 5, pull);
      lElbowAngle = rElbowAngle = lerp(0, -120, pull);
      lHipAngle = 5;
      rHipAngle = lerp(-45, 0, pull);
      rHipRoll = lerp(30, 0, pull);
      rKneeAngle = lerp(40, 0, pull);
      lAnkleAngle = 30;
    } else {
      lShoulderLift = rShoulderLift = lerp(5, 40, (p - 0.8) / 0.2);
      lElbowAngle = rElbowAngle = lerp(-120, 0, (p - 0.8) / 0.2);
      rHipAngle = 0;
      rHipRoll = 0;
      rKneeAngle = 0;
      lAnkleAngle = 0;
    }


  } else if (mode === "sitSpin") {
    const duration = 5.0;
    const p = (t % duration) / duration;
    const totalRotations = 6;
    globalSpinAngle = ((-Math.cos(p * Math.PI) + 1) / 2) * totalRotations * 360;
    if (p < 0.25) {
      const eased = easeInOutSine(p / 0.25);
      globalJumpHeight = eased * -2.2;
      torsoLean = eased * 45;
      lHipAngle = eased * -110; 
      lKneeAngle = eased * 130;
      rHipAngle = eased * -130;
      lShoulderSwing = rShoulderSwing = eased * -80;
    } else if (p < 0.75) {
      globalJumpHeight = -2.2; torsoLean = 45;
      lHipAngle = -110; 
      lKneeAngle = 130; 
      rHipAngle = -130;
      lShoulderSwing = rShoulderSwing = -80;
    } else {
      const eased = easeInOutSine((p - 0.75) / 0.25);
      globalJumpHeight = -2.2 * (1 - eased);
      torsoLean = 45 * (1 - eased);
      lHipAngle = -110 * (1 - eased); 
      lKneeAngle = 130 * (1 - eased);
      rHipAngle = -130 * (1 - eased);
      lShoulderSwing = rShoulderSwing = -80 * (1 - eased);
    }


  } else if (mode === "spiral") {
    const duration = 5.0;
    const p = (t % duration) / duration;
    const eased = p < 0.2 ? easeInOutSine(p / 0.2) : (p > 0.8 ? easeInOutSine((1 - p) / 0.2) : 1.0);
    torsoLean = eased * 85;
    headAngle = eased * -70;
    rHipAngle = eased * -115;
    rKneeAngle = eased * -5;
    rAnkleAngle = 20;
    lShoulderLift = eased * 90; rShoulderLift = eased * 90;
    lShoulderSwing = eased * -20; rShoulderSwing = eased * -20;
    if (p >= 0.2 && p <= 0.8) {
      const sway = Math.sin(t * 2) * 3;
      torsoRoll = sway;
      lShoulderLift += sway;
      rShoulderLift -= sway;
    }
  }


  let targetPose = capturePose();
  
  if (blendTime > 0 && prevPose) {
    const mix = 1.0 - (blendTime / BLEND_DURATION);
    const easedMix = easeInOutSine(mix);
    
    currentRenderState = {
      gX: lerp(prevPose.gX, targetPose.gX, easedMix),
      gY: lerp(prevPose.gY, targetPose.gY, easedMix),
      gSpin: lerpSpin(prevPose.gSpin, targetPose.gSpin, easedMix),
      tLean: lerp(prevPose.tLean, targetPose.tLean, easedMix),
      tTwist: lerp(prevPose.tTwist, targetPose.tTwist, easedMix),
      tRoll: lerp(prevPose.tRoll, targetPose.tRoll, easedMix),
      head: lerp(prevPose.head, targetPose.head, easedMix),
      lSLift: lerp(prevPose.lSLift, targetPose.lSLift, easedMix),
      rSLift: lerp(prevPose.rSLift, targetPose.rSLift, easedMix),
      lSSwing: lerp(prevPose.lSSwing, targetPose.lSSwing, easedMix),
      rSSwing: lerp(prevPose.rSSwing, targetPose.rSSwing, easedMix),
      lSTwist: lerp(prevPose.lSTwist, targetPose.lSTwist, easedMix),
      rSTwist: lerp(prevPose.rSTwist, targetPose.rSTwist, easedMix),
      lElbow: lerp(prevPose.lElbow, targetPose.lElbow, easedMix),
      rElbow: lerp(prevPose.rElbow, targetPose.rElbow, easedMix),
      lHip: lerp(prevPose.lHip, targetPose.lHip, easedMix),
      rHip: lerp(prevPose.rHip, targetPose.rHip, easedMix),
      lHipR: lerp(prevPose.lHipR, targetPose.lHipR, easedMix),
      rHipR: lerp(prevPose.rHipR, targetPose.rHipR, easedMix),
      lKnee: lerp(prevPose.lKnee, targetPose.lKnee, easedMix),
      rKnee: lerp(prevPose.rKnee, targetPose.rKnee, easedMix),
      lAnkle: lerp(prevPose.lAnkle, targetPose.lAnkle, easedMix),
      rAnkle: lerp(prevPose.rAnkle, targetPose.rAnkle, easedMix)
    };
    
    blendTime -= (1/60); 
  } else {
    currentRenderState = targetPose;
    blendTime = 0;
  }

  return currentRenderState;
}