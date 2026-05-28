/* 
인간 캐릭터 계층 모델 구현 코드
*/

export function renderCharacter(renderState, utils) {
  const { pushMatrix, popMatrix, applyTransform, drawCylinder, drawSphere, drawCube, colors } = utils;
  const { armorColorDark, jointColor } = colors;

  pushMatrix();
    //root
    applyTransform(window.translate(renderState.gX, renderState.gY, 0.0));
    applyTransform(window.rotateY(renderState.gSpin));
    applyTransform(window.rotateZ(renderState.tRoll)); 
    applyTransform(window.rotateY(renderState.tTwist)); 
    applyTransform(window.rotateX(renderState.tLean));  

    // 몸통
    drawCylinder(1.5, 2.2, 0.8, armorColorDark); 
    drawSphere(0.4, 0.4, 0.4, jointColor); 

    // 목, 머리
    pushMatrix();
      applyTransform(window.translate(0.0, 1.1, 0.0)); 
      drawCylinder(0.3, 0.3, 0.3, armorColorDark);
      applyTransform(window.translate(0.0, 0.2, 0.0)); 
      applyTransform(window.rotateX(renderState.head)); 
      applyTransform(window.translate(0.0, 0.6, 0.0)); 
      drawSphere(0.9, 0.9, 0.9, armorColorDark);
    popMatrix();

    //왼쪽 팔
    pushMatrix();
      applyTransform(window.translate(0.95, 0.9, 0.0)); 
      drawSphere(0.4, 0.4, 0.4, jointColor); // 어깨 관절
      applyTransform(window.rotateZ(renderState.lSLift)); 
      applyTransform(window.rotateX(renderState.lSSwing));
      applyTransform(window.rotateY(renderState.lSTwist));
      
      pushMatrix();
        applyTransform(window.translate(0.0, -0.6, 0.0)); 
        drawCylinder(0.4, 1.2, 0.4, armorColorDark); 
      popMatrix();
      
      pushMatrix();
        applyTransform(window.translate(0.0, -1.2, 0.0)); 
        drawSphere(0.35, 0.35, 0.35, jointColor);
        applyTransform(window.rotateX(renderState.lElbow));
        
        pushMatrix();
          applyTransform(window.translate(0.0, -0.6, 0.0));
          drawCylinder(0.35, 1.2, 0.35, armorColorDark);
        popMatrix();
        
        pushMatrix();
          applyTransform(window.translate(0.0, -1.3, 0.0));
          drawSphere(0.3, 0.4, 0.3, jointColor); 
        popMatrix();
      popMatrix();
    popMatrix();

    //오른쪽 팔
    pushMatrix();
      applyTransform(window.translate(-0.95, 0.9, 0.0)); 
      drawSphere(0.4, 0.4, 0.4, jointColor); 
      applyTransform(window.rotateZ(-renderState.rSLift));
      applyTransform(window.rotateX(renderState.rSSwing));
      applyTransform(window.rotateY(renderState.rSTwist));
      
      pushMatrix();
        applyTransform(window.translate(0.0, -0.6, 0.0)); 
        drawCylinder(0.4, 1.2, 0.4, armorColorDark); 
      popMatrix();
      
      pushMatrix();
        applyTransform(window.translate(0.0, -1.2, 0.0)); 
        drawSphere(0.35, 0.35, 0.35, jointColor); 
        applyTransform(window.rotateX(renderState.rElbow));
        
        pushMatrix();
          applyTransform(window.translate(0.0, -0.6, 0.0));
          drawCylinder(0.35, 1.2, 0.35, armorColorDark); 
        popMatrix();
        
        pushMatrix();
          applyTransform(window.translate(0.0, -1.3, 0.0));
          drawSphere(0.3, 0.4, 0.3, jointColor); 
        popMatrix();
      popMatrix();
    popMatrix();

    //왼쪽 다리
    pushMatrix();
      applyTransform(window.translate(0.4, -1.1, 0.0)); 
      drawSphere(0.5, 0.5, 0.5, jointColor);
      applyTransform(window.rotateZ(renderState.lHipR)); 
      applyTransform(window.rotateX(renderState.lHip)); 
      
      pushMatrix();
        applyTransform(window.translate(0.0, -0.8, 0.0)); 
        drawCylinder(0.5, 1.6, 0.5, armorColorDark); 
      popMatrix();
      
      pushMatrix();
        applyTransform(window.translate(0.0, -1.6, 0.0)); 
        drawSphere(0.45, 0.45, 0.45, jointColor);
        applyTransform(window.rotateX(renderState.lKnee));
        
        pushMatrix();
          applyTransform(window.translate(0.0, -0.8, 0.0));
          drawCylinder(0.45, 1.6, 0.45, armorColorDark);
        popMatrix();
        
        pushMatrix(); //스케이트
          applyTransform(window.translate(0.0, -1.3, 0.0));
          applyTransform(window.rotateX(renderState.lAnkle));

          pushMatrix();
            applyTransform(window.translate(0.0, 0.0, -0.05));
            drawCylinder(0.35, 0.4, 0.35, armorColorDark);
          popMatrix();
          pushMatrix();
            applyTransform(window.translate(0.0, -0.15, 0.15));
            drawCube(0.35, 0.3, 0.6, armorColorDark); 
          popMatrix();
          pushMatrix();
            applyTransform(window.translate(0.0, -0.35, 0.3));
            drawCube(0.08, 0.2, 0.15, armorColorDark);
          popMatrix();
          pushMatrix();
            applyTransform(window.translate(0.0, -0.35, 0.0));
            drawCube(0.08, 0.2, 0.15, armorColorDark);
          popMatrix();

          pushMatrix();
            applyTransform(window.translate(0.0, -0.45, 0.15));
            drawCube(0.04, 0.1, 1.0, jointColor);
          popMatrix();
        popMatrix();
      popMatrix();
    popMatrix();

    //오른쪽 다리
    pushMatrix();
      applyTransform(window.translate(-0.4, -1.1, 0.0)); 
      drawSphere(0.5, 0.5, 0.5, jointColor); 
      applyTransform(window.rotateZ(renderState.rHipR)); 
      applyTransform(window.rotateX(renderState.rHip)); 
      
      pushMatrix();
        applyTransform(window.translate(0.0, -0.8, 0.0)); 
        drawCylinder(0.5, 1.6, 0.5, armorColorDark); 
      popMatrix();
      
      pushMatrix();
        applyTransform(window.translate(0.0, -1.6, 0.0)); 
        drawSphere(0.45, 0.45, 0.45, jointColor); 
        applyTransform(window.rotateX(renderState.rKnee));
        
        pushMatrix();
          applyTransform(window.translate(0.0, -0.8, 0.0));
          drawCylinder(0.45, 1.6, 0.45, armorColorDark); 
        popMatrix();
        
        pushMatrix(); //스케이트
          applyTransform(window.translate(0.0, -1.3, 0.0));
          applyTransform(window.rotateX(renderState.rAnkle));

          pushMatrix();
            applyTransform(window.translate(0.0, 0.0, -0.05));
            drawCylinder(0.35, 0.4, 0.35, armorColorDark);
          popMatrix();

          pushMatrix();
            applyTransform(window.translate(0.0, -0.15, 0.15));
            drawCube(0.35, 0.3, 0.6, armorColorDark); 
          popMatrix();

          pushMatrix();
            applyTransform(window.translate(0.0, -0.35, 0.3));
            drawCube(0.08, 0.2, 0.15, armorColorDark);
          popMatrix();
          pushMatrix();
            applyTransform(window.translate(0.0, -0.35, 0.0));
            drawCube(0.08, 0.2, 0.15, armorColorDark);
          popMatrix();

          pushMatrix();
            applyTransform(window.translate(0.0, -0.45, 0.15));
            drawCube(0.04, 0.1, 1.0, jointColor); 
          popMatrix();
        popMatrix();
      popMatrix();
    popMatrix();
    
  popMatrix(); 
}

export function renderAudience(audState, utils, color) {
  const { xPos, standHeight, bounce, z } = audState;
  const { pushMatrix, popMatrix, applyTransform, drawCylinder, drawSphere, drawCube, colors } = utils;
  const jColor = window.vec4(0.9, 0.7, 0.6, 1.0);
  pushMatrix();
    applyTransform(window.translate(xPos, standHeight + bounce, z));
    drawCylinder(1, 6, 4, color);
    pushMatrix();
        applyTransform(window.translate(0.0, 5.5, 0.0));
        drawSphere(3, 3, 3, jColor);
    popMatrix();

    pushMatrix();
        applyTransform(window.translate(0, 3, -2));
        drawSphere(1, 1, 1, jColor);
        applyTransform(window.rotateX(audState.lShoulder));
        pushMatrix();
            applyTransform(window.translate(0, -1.2, 0));
            drawCylinder(1, 2.4, 1, color);
        popMatrix(); 
        pushMatrix();
            applyTransform(window.translate(0.0, -2.4, 0.0));
            drawSphere(1, 1, 1, jColor);
            applyTransform(window.rotateX(audState.lElbow));
            pushMatrix();
                applyTransform(window.translate(0.0, -0.8, 0.0));
                drawCylinder(1, 1.6, 1, color);
            popMatrix();
            pushMatrix();
                applyTransform(window.translate(0.0, -1.6, 0.0));
                drawSphere(1, 1, 1, jColor);
            popMatrix();
        popMatrix();   
    popMatrix();

    pushMatrix();
        applyTransform(window.translate(0, 3, 2));
        drawSphere(1, 1, 1, jColor);
        applyTransform(window.rotateX(audState.rShoulder));
        pushMatrix();
            applyTransform(window.translate(0, -1.2, 0));
            drawCylinder(1, 2.4, 1, color);
        popMatrix(); 
        pushMatrix();
            applyTransform(window.translate(0.0, -2.4, 0.0));
            drawSphere(1, 1, 1, jColor);
            applyTransform(window.rotateX(audState.rElbow));
            pushMatrix();
                applyTransform(window.translate(0.0, -0.8, 0.0));
                drawCylinder(1, 1.6, 1, color);
            popMatrix();
            pushMatrix();
                applyTransform(window.translate(0.0, -1.6, 0.0));
                drawSphere(1, 1, 1, jColor);
            popMatrix();
        popMatrix();   
    popMatrix();     
  popMatrix();
}