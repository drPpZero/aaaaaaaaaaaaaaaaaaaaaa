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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t) {
  return t * t;
}

function lerpSpin(start, end, mix) {
  let diff = end - start;
  diff = ((diff + 180) % 360 + 360) % 360 - 180;
  return start + diff * mix;
}

function capturePose() {
  return {
    gX: globalXPos,
    gY: globalJumpHeight,
    gSpin: globalSpinAngle,

    tLean: torsoLean,
    tTwist: torsoTwist,
    tRoll: torsoRoll,
    head: headAngle,

    lSLift: lShoulderLift,
    rSLift: rShoulderLift,
    lSSwing: lShoulderSwing,
    rSSwing: rShoulderSwing,
    lSTwist: lShoulderTwist,
    rSTwist: rShoulderTwist,

    lElbow: lElbowAngle,
    rElbow: rElbowAngle,

    lHip: lHipAngle,
    rHip: rHipAngle,
    lHipR: lHipRoll,
    rHipR: rHipRoll,

    lKnee: lKneeAngle,
    rKnee: rKneeAngle,
    lAnkle: lAnkleAngle,
    rAnkle: rAnkleAngle,
  };
}

export function getUpdatedRenderState(mode, t) {
  if (lastMode !== mode) {
    prevPose = capturePose();
    blendTime = BLEND_DURATION;
    lastMode = mode;
  }

  globalXPos = 0;
  globalJumpHeight = 0;
  globalSpinAngle = 0;

  torsoLean = 0;
  torsoTwist = 0;
  torsoRoll = 0;
  headAngle = 0;

  lShoulderLift = 0;
  rShoulderLift = 0;
  lShoulderSwing = 0;
  rShoulderSwing = 0;
  lShoulderTwist = 0;
  rShoulderTwist = 0;

  lElbowAngle = 0;
  rElbowAngle = 0;

  lHipAngle = 0;
  rHipAngle = 0;
  lHipRoll = 0;
  rHipRoll = 0;

  lKneeAngle = 0;
  rKneeAngle = 0;
  lAnkleAngle = 0;
  rAnkleAngle = 0;

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

    lShoulderLift = -20;
    rShoulderLift = -20;
    lShoulderSwing = 20;
    rShoulderSwing = 20;

    lElbowAngle = -10;
    rElbowAngle = -10;

    headAngle = -torsoRoll * 0.5;
  }

  else if (mode === "landingStep") {
    const duration = 0.8;
    const p = Math.min((t % duration) / duration, 1.0);
    const eased = easeOutQuad(p);
    const smooth = easeInOutSine(p);

    // 착지 직후 낮은 자세에서 서서히 기본 자세로 회복
    globalJumpHeight = lerp(-0.35, 0.08, eased);

    // 무릎으로 충격 흡수 후 펴기
    lKneeAngle = lerp(45, 8, eased);
    rKneeAngle = lerp(45, 8, eased);

    // 몸통을 숙였다가 Side Step의 기본 기울기로 회복
    torsoLean = lerp(22, 8, smooth);
    torsoTwist = lerp(10, 0, smooth);
    torsoRoll = lerp(4, 0, smooth);

    // 엉덩이와 다리 정리
    lHipAngle = lerp(-20, 0, smooth);
    rHipAngle = lerp(-20, 0, smooth);
    lHipRoll = lerp(4, 0, smooth);
    rHipRoll = lerp(-4, 0, smooth);

    // 팔을 크게 위로 벌리지 않고, 낮은 균형 자세에서 Side Step 자세로 이동
    lShoulderLift = lerp(5, -20, smooth);
    rShoulderLift = lerp(5, -20, smooth);

    // 좌우로 살짝 열린 팔을 Side Step 팔 위치로 정리
    lShoulderSwing = lerp(5, 20, smooth);
    rShoulderSwing = lerp(5, 20, smooth);

    lElbowAngle = lerp(-5, -10, smooth);
    rElbowAngle = lerp(-5, -10, smooth);

    headAngle = lerp(-6, 0, smooth);
  }

  else if (mode === "toeLoop") {
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
    }

    else if (p < 0.3) {
      const eased = easeInQuad((p - 0.15) / 0.15);

      globalJumpHeight = lerp(-0.4, 0.2, eased);

      rKneeAngle = lerp(50, 0, eased);
      lHipAngle = lerp(-40, 0, eased);
      torsoTwist = lerp(-40, 0, eased);

      lShoulderLift = rShoulderLift = lerp(45, 5, eased);
      lShoulderSwing = lerp(30, 0, eased);
      rShoulderSwing = lerp(-30, 0, eased);
    }

    else if (p < 0.8) {
      const pFlight = (p - 0.3) / 0.5;
      const arc = Math.sin(pFlight * Math.PI);

      globalJumpHeight = 0.2 + arc * 3.5;
      globalSpinAngle = pFlight * 360;

      lShoulderLift = 5;
      rShoulderLift = 5;
      lElbowAngle = -130;
      rElbowAngle = -130;

      lHipAngle = 0;
      rHipAngle = 0;
      lKneeAngle = 0;
      rKneeAngle = 0;
    }

    else {
      const pLand = (p - 0.8) / 0.2;
      const eased = easeOutQuad(pLand);
      const smooth = easeInOutSine(pLand);

      // Jump가 landingStep의 시작 자세와 자연스럽게 이어지도록 끝남
      globalJumpHeight = lerp(0.2, -0.35, eased);
      globalSpinAngle = 360;

      // 무릎을 굽혀 착지 준비
      lKneeAngle = lerp(0, 45, eased);
      rKneeAngle = lerp(0, 45, eased);

      lHipAngle = lerp(0, -20, smooth);
      rHipAngle = lerp(0, -20, smooth);

      torsoLean = lerp(5, 22, smooth);
      torsoTwist = lerp(0, 10, smooth);
      torsoRoll = lerp(0, 4, smooth);

      // 팔을 위로 벌리지 않고, 낮게 정리된 착지 자세로 이동
      lShoulderLift = lerp(5, 5, smooth);
      rShoulderLift = lerp(5, 5, smooth);

      // 팔을 몸 옆으로 살짝 열어 균형 잡는 정도만 표현
      lShoulderSwing = lerp(0, 5, smooth);
      rShoulderSwing = lerp(0, 5, smooth);

      // 공중에서 접힌 팔을 착지하면서 자연스럽게 풀기
      lElbowAngle = lerp(-130, -5, smooth);
      rElbowAngle = lerp(-130, -5, smooth);

      headAngle = lerp(0, -6, smooth);
    }
  }

else if (mode === "splitJump") {
  const duration = 2.0;
  const p = (t % duration) / duration;

  if (p < 0.3) {
    const eased = easeInQuad(p / 0.3);

    // 점프 준비: 살짝 앉고 팔을 준비 자세로 올림
    globalJumpHeight = -eased * 0.4;

    lKneeAngle = eased * 20;
    rKneeAngle = eased * 20;

    torsoLean = eased * 10;

    lShoulderLift = eased * 30;
    rShoulderLift = eased * 30;

    lShoulderSwing = 0;
    rShoulderSwing = 0;
  }

  else if (p < 0.7) {
    const pJump = (p - 0.3) / 0.4;

    // 높이는 포물선 arc 사용
    const heightArc = Math.sin(pJump * Math.PI);
    globalJumpHeight = -0.4 + heightArc * 3.0;

    // 다리 벌림은 arc를 쓰지 않음.
    // 초반에 빠르게 벌린 뒤, 공중에서 계속 유지한다.
    const openAmount =
      pJump < 0.25
        ? easeOutQuad(pJump / 0.25)
        : 1.0;

    lHipAngle = openAmount * 100;
    rHipAngle = openAmount * -100;

    // Split Jump는 회전 점프가 아니므로 몸통 회전은 작게만 준다.
    torsoTwist = openAmount * 20;
    torsoLean = 0;

    // 팔도 180도처럼 과하게 벌리지 않고, 공중 균형 자세 정도로 유지
    lShoulderLift = openAmount * 55;
    rShoulderLift = openAmount * 55;

    lShoulderSwing = 0;
    rShoulderSwing = 0;

    lElbowAngle = 0;
    rElbowAngle = 0;
  }

  else {
    const pLand = (p - 0.7) / 0.3;
    const eased = easeOutQuad(pLand);
    const smooth = easeInOutSine(pLand);

    // 공중에서 그대로 내려오며 착지
    globalJumpHeight = lerp(0.0, -0.35, eased);

    // 핵심:
    // 공중에서 벌린 다리가 다시 펴지거나 모였다가 시작하지 않고,
    // 벌어진 상태에서 바로 앞뒤 교차 자세로 이어진다.
    lHipAngle = lerp(100, -30, smooth);
    rHipAngle = lerp(-100, 30, smooth);

    // 착지 충격 흡수
    lKneeAngle = lerp(0, 45, eased);
    rKneeAngle = lerp(0, 45, eased);

    // 몸통은 반대로 확 돌아가지 않게 작게 정리
    torsoTwist = lerp(20, 5, smooth);
    torsoLean = lerp(0, 22, smooth);
    torsoRoll = lerp(0, 4, smooth);

    // 팔은 착지하면서 위로 더 벌어지지 않고 자연스럽게 내려온다.
    lShoulderLift = lerp(55, 5, smooth);
    rShoulderLift = lerp(55, 5, smooth);

    // 팔을 좌우로 크게 벌리지 않음
    lShoulderSwing = lerp(0, 5, smooth);
    rShoulderSwing = lerp(0, 5, smooth);

    lElbowAngle = lerp(0, -5, smooth);
    rElbowAngle = lerp(0, -5, smooth);

    headAngle = lerp(0, -6, smooth);
  }
}

  else if (mode === "uprightSpin") {
    const duration = 3.0;
    const p = (t % duration) / duration;
    const totalRotations = 4;

    globalSpinAngle = ((-Math.cos(p * Math.PI) + 1) / 2) * totalRotations * 360;

    if (p < 0.2) {
      lShoulderLift = 80;
      rShoulderLift = 80;

      lHipRoll = 10;

      rHipAngle = -60;
      rHipRoll = 30;
      rKneeAngle = 20;

      lAnkleAngle = 30;
    }

    else if (p < 0.8) {
      const pIn = (p - 0.2) / 0.6;
      const pull = easeInOutSine(pIn);

      lShoulderLift = lerp(80, 5, pull);
      rShoulderLift = lerp(80, 5, pull);

      lElbowAngle = lerp(0, -120, pull);
      rElbowAngle = lerp(0, -120, pull);

      lHipAngle = 5;

      rHipAngle = lerp(-45, 0, pull);
      rHipRoll = lerp(30, 0, pull);
      rKneeAngle = lerp(40, 0, pull);

      lAnkleAngle = 30;
    }

    else {
      const pOut = (p - 0.8) / 0.2;

      lShoulderLift = lerp(5, 40, pOut);
      rShoulderLift = lerp(5, 40, pOut);

      lElbowAngle = lerp(-120, 0, pOut);
      rElbowAngle = lerp(-120, 0, pOut);

      rHipAngle = 0;
      rHipRoll = 0;
      rKneeAngle = 0;
      lAnkleAngle = 0;
    }
  }

  else if (mode === "sitSpin") {
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

      lShoulderSwing = eased * -80;
      rShoulderSwing = eased * -80;
    }

    else if (p < 0.75) {
      globalJumpHeight = -2.2;
      torsoLean = 45;

      lHipAngle = -110;
      lKneeAngle = 130;
      rHipAngle = -130;

      lShoulderSwing = -80;
      rShoulderSwing = -80;
    }

    else {
      const pOut = (p - 0.75) / 0.25;
      const eased = easeOutQuad(pOut);
      const smooth = easeInOutSine(pOut);

      // 앉은 스핀에서 자연스럽게 일어남
      globalJumpHeight = lerp(-2.2, 0.0, eased);
      torsoLean = lerp(45, 8, smooth);

      lHipAngle = lerp(-110, 0, smooth);
      rHipAngle = lerp(-130, 0, smooth);

      lKneeAngle = lerp(130, 0, smooth);
      rKneeAngle = lerp(40, 0, smooth);

      lShoulderSwing = lerp(-80, 20, smooth);
      rShoulderSwing = lerp(-80, 20, smooth);

      lShoulderLift = lerp(0, -20, smooth);
      rShoulderLift = lerp(0, -20, smooth);

      lElbowAngle = lerp(0, -10, smooth);
      rElbowAngle = lerp(0, -10, smooth);
    }
  }

  else if (mode === "spiral") {
    const duration = 5.0;
    const p = (t % duration) / duration;

    const eased =
      p < 0.2
        ? easeInOutSine(p / 0.2)
        : p > 0.8
          ? easeInOutSine((1 - p) / 0.2)
          : 1.0;

    torsoLean = eased * 85;
    headAngle = eased * -70;

    rHipAngle = eased * -115;
    rKneeAngle = eased * -5;
    rAnkleAngle = 20;

    lShoulderLift = eased * 90;
    rShoulderLift = eased * 90;

    lShoulderSwing = eased * -20;
    rShoulderSwing = eased * -20;

    if (p >= 0.2 && p <= 0.8) {
      const sway = Math.sin(t * 2) * 3;

      torsoRoll = sway;
      lShoulderLift += sway;
      rShoulderLift -= sway;
    }
  }

  let targetPose = capturePose();

  if (blendTime > 0 && prevPose) {
    const mix = 1.0 - blendTime / BLEND_DURATION;
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
      rAnkle: lerp(prevPose.rAnkle, targetPose.rAnkle, easedMix),
    };

    blendTime -= 1 / 60;
  }

  else {
    currentRenderState = targetPose;
    blendTime = 0;
  }

  return currentRenderState;
}