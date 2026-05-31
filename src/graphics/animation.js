let globalXPos = 0.0, globalJumpHeight = 0.0, globalSpinAngle = 0.0;
let torsoLean = 0.0, torsoTwist = 0.0, torsoRoll = 0.0, headAngle = 0.0;
let lShoulderLift = 0.0, rShoulderLift = 0.0, lShoulderSwing = 0.0, rShoulderSwing = 0.0, lShoulderTwist = 0.0, rShoulderTwist = 0.0;
let lElbowAngle = 0.0, rElbowAngle = 0.0;
let lHipAngle = 0.0, rHipAngle = 0.0, lHipRoll = 0.0, rHipRoll = 0.0;
let lKneeAngle = 0.0, rKneeAngle = 0.0, lAnkleAngle = 0.0, rAnkleAngle = 0.0;

// 이전 동작과 현재 동작 사이의 부드러운 전환을 위한 상태값
let prevPose = null;
let blendTime = 0.0;
const BLEND_DURATION = 0.4;
let lastMode = null;
let currentRenderState = capturePose();

// 선형 보간 함수: a에서 b까지 t 비율만큼 이동
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// 부드러운 시작과 끝을 만드는 easing 함수들
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function easeInQuad(t) {
  return t * t;
}

// 회전 각도를 보간할 때 360도 경계에서 갑자기 반대로 도는 문제를 줄이기 위한 함수
function lerpSpin(start, end, mix) {
  let diff = end - start;
  diff = ((diff + 180) % 360 + 360) % 360 - 180;
  return start + diff * mix;
}

// 현재 전역 관절 값을 하나의 pose 객체로 저장
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
  // 동작 모드가 바뀌면 이전 pose를 저장하고 blend를 시작
  if (lastMode !== mode) {
    prevPose = capturePose();
    blendTime = BLEND_DURATION;
    lastMode = mode;
  }

  // 매 프레임마다 기본값으로 초기화한 뒤, 현재 mode에 맞게 다시 설정
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

    // 좌우로 몸이 흔들리며 빙판 위를 걷는 느낌을 표현
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

    // 점프 직후 낮은 자세에서 기본 자세로 회복하는 연결 동작
    globalJumpHeight = lerp(-0.35, 0.08, eased);

    lKneeAngle = lerp(45, 8, eased);
    rKneeAngle = lerp(45, 8, eased);

    torsoLean = lerp(22, 8, smooth);
    torsoTwist = lerp(10, 0, smooth);
    torsoRoll = lerp(4, 0, smooth);

    lHipAngle = lerp(-20, 0, smooth);
    rHipAngle = lerp(-20, 0, smooth);
    lHipRoll = lerp(4, 0, smooth);
    rHipRoll = lerp(-4, 0, smooth);

    // 팔이 과하게 올라가지 않도록 낮은 균형 자세에서 정리
    lShoulderLift = lerp(5, -20, smooth);
    rShoulderLift = lerp(5, -20, smooth);

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

      // 점프 준비: 몸을 낮추고 회전 준비 자세를 만듦
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

      // 점프 도약 구간
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

      // 공중에서 한 바퀴 회전하는 구간
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

      // 착지 후 landingStep과 자연스럽게 이어지도록 마무리 자세 설정
      globalJumpHeight = lerp(0.2, -0.35, eased);
      globalSpinAngle = 360;

      lKneeAngle = lerp(0, 45, eased);
      rKneeAngle = lerp(0, 45, eased);

      lHipAngle = lerp(0, -20, smooth);
      rHipAngle = lerp(0, -20, smooth);

      torsoLean = lerp(5, 22, smooth);
      torsoTwist = lerp(0, 10, smooth);
      torsoRoll = lerp(0, 4, smooth);

      lShoulderLift = lerp(5, 5, smooth);
      rShoulderLift = lerp(5, 5, smooth);

      lShoulderSwing = lerp(0, 5, smooth);
      rShoulderSwing = lerp(0, 5, smooth);

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

      // 높이는 포물선 형태로 변화
      const heightArc = Math.sin(pJump * Math.PI);
      globalJumpHeight = -0.4 + heightArc * 3.0;

      // 다리는 초반에 빠르게 벌리고, 공중에서는 벌어진 자세를 유지
      const openAmount =
        pJump < 0.25
          ? easeOutQuad(pJump / 0.25)
          : 1.0;

      lHipAngle = openAmount * 100;
      rHipAngle = openAmount * -100;

      // Split Jump는 회전 동작이 아니므로 몸통 회전은 작게만 표현
      torsoTwist = openAmount * 20;
      torsoLean = 0;

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

      // 공중에서 벌린 자세를 유지한 채 내려오며 착지
      globalJumpHeight = lerp(0.0, -0.35, eased);

      // 벌어진 다리가 다시 펴지지 않고 자연스럽게 앞뒤 교차 자세로 이어짐
      lHipAngle = lerp(100, -30, smooth);
      rHipAngle = lerp(-100, 30, smooth);

      lKneeAngle = lerp(0, 45, eased);
      rKneeAngle = lerp(0, 45, eased);

      torsoTwist = lerp(20, 5, smooth);
      torsoLean = lerp(0, 22, smooth);
      torsoRoll = lerp(0, 4, smooth);

      // 착지하면서 팔을 낮게 정리
      lShoulderLift = lerp(55, 5, smooth);
      rShoulderLift = lerp(55, 5, smooth);

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

    // 시간에 따라 회전 각도를 증가시켜 제자리 스핀 표현
    globalSpinAngle = ((-Math.cos(p * Math.PI) + 1) / 2) * totalRotations * 360;

    if (p < 0.2) {
      // 스핀 진입 자세
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

      // 팔과 다리를 몸쪽으로 모아 회전하는 자세
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

      // 스핀을 마무리하며 팔을 다시 풀어줌
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

      // 앉은 자세로 내려가는 구간
      globalJumpHeight = eased * -2.2;
      torsoLean = eased * 45;

      lHipAngle = eased * -110;
      lKneeAngle = eased * 130;
      rHipAngle = eased * -130;

      lShoulderSwing = eased * -80;
      rShoulderSwing = eased * -80;
    }

    else if (p < 0.75) {
      // 낮은 자세를 유지하면서 회전
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

    // 시작과 끝은 부드럽게, 중간에는 spiral 자세 유지
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

      // 고정된 자세가 너무 정적으로 보이지 않도록 작은 흔들림 추가
      torsoRoll = sway;
      lShoulderLift += sway;
      rShoulderLift -= sway;
    }
  }

  const targetPose = capturePose();

  // mode가 바뀐 직후에는 이전 pose와 현재 pose를 보간하여 부드럽게 연결
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