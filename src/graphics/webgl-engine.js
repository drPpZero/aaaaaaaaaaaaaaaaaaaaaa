import { renderCharacter, renderAudience } from "./character.js";
import { getUpdatedRenderState } from "./animation.js";
import { buildGeometry } from "./geometry.js";

let gl;
let program;
let modelViewMatrixLoc;

let points = [];
let vPositionBuffer, vColorBuffer;
const colors = [];

export let zoomLevel = 1.0;

let geoOffsets;

let jointColor, armorColorDark, armorColorLight, gridColor;
let adColor1, adColor2;

let modelViewMatrix;
const matrixStack = [];
let renderState = {};
let currentAnim = "sideStep";

export function adjustZoom(delta) {
  zoomLevel = Math.max(0.5, Math.min(2.0, zoomLevel + delta));
}

export function resetZoom() {
  zoomLevel = 1.0;
}

function pushMatrix() {
    const copy = window.mat4();
    for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { copy[i][j] = modelViewMatrix[i][j]; } }
    matrixStack.push(copy);
}

function popMatrix() {
    if (matrixStack.length === 0) throw "Invalid popMatrix!";
    modelViewMatrix = matrixStack.pop();
}

function applyTransform(matrix) {
    modelViewMatrix = window.mult(modelViewMatrix, matrix);
}

function drawShape(offset, count, scaleX, scaleY, scaleZ, color) {
    pushMatrix();
    modelViewMatrix = window.mult(modelViewMatrix, window.scalem(scaleX, scaleY, scaleZ));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, window.flatten(modelViewMatrix));
    gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
    const updatedColors = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
        updatedColors[i*4] = color[0]; updatedColors[i*4+1] = color[1]; updatedColors[i*4+2] = color[2]; updatedColors[i*4+3] = color[3];
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, offset * 16, updatedColors); 
    gl.drawArrays(gl.TRIANGLES, offset, count);
    popMatrix();
}

function drawCube(sx, sy, sz, color) { drawShape(geoOffsets.cube.offset, geoOffsets.cube.count, sx, sy, sz, color); }
function drawCylinder(sx, sy, sz, color) { drawShape(geoOffsets.cylinder.offset, geoOffsets.cylinder.count, sx, sy, sz, color); }
function drawSphere(sx, sy, sz, color) { drawShape(geoOffsets.sphere.offset, geoOffsets.sphere.count, sx, sy, sz, color); }

export function initWebGL(canvas) {
  gl = window.WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); return; }

  jointColor = window.vec4(0.85, 0.7, 0.2, 1.0);  
  armorColorDark = window.vec4(0.1, 0.1, 0.1, 1.0); 
  armorColorLight = window.vec4(0.5, 0.5, 0.5, 1.0); 
  bladeColor = window.vec4(0.7, 0.7, 0.7, 1.0);  
  gridColor = window.vec4(0.6, 0.8, 1.0, 1.0);   
  
  iceColor = window.vec4(0.9, 0.95, 1.0, 1.0);
  iceMarkColor = window.vec4(0.7, 0.8, 0.9, 1.0);
  wallBaseColor = window.vec4(0.2, 0.2, 0.3, 1.0);
  adColor1 = window.vec4(1.0, 0.2, 0.2, 1.0); 
  adColor2 = window.vec4(0.2, 0.4, 1.0, 1.0); 

  points = [];
  const geometryData = buildGeometry();
  points = geometryData.points;
  geoOffsets = geometryData.offsets;
  generateAudienceColors();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.85, 0.95, 1.0); 
  gl.enable(gl.DEPTH_TEST);

  program = window.initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  vPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, window.flatten(points), gl.STATIC_DRAW);
  
  const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  vColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, (points.length) * 16, gl.DYNAMIC_DRAW); 
  
  const vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  const projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  const projectionMatrix = window.perspective(45.0, canvas.width / canvas.height, 0.1, 2000.0);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, window.flatten(projectionMatrix));
  renderState = getUpdatedRenderState("sideStep", 0);
}

export function updateAnimation(mode, timeInSeconds) {
  currentAnim = mode;
  renderState = getUpdatedRenderState(mode, timeInSeconds);
}

export function renderWebGL(currentTimeSeconds, isPlayMode = false) {
  if (!gl) return;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const baseX = 15.588, baseY = 3.0, baseZ = 9.0;   
  const eye = window.vec3(baseX * zoomLevel, baseY * zoomLevel, baseZ * zoomLevel);
  const at = window.vec3(0.0, 0.0, 0.0);
  const up = window.vec3(0.0, 1.0, 0.0);
  modelViewMatrix = window.lookAt(eye, at, up);

  if (isPlayMode) {
    renderArena(currentTimeSeconds);
  } else {
    renderGrid(currentTimeSeconds);
  }

  renderCharacter(renderState, {
    pushMatrix,
    popMatrix,
    applyTransform,
    drawCylinder,
    drawSphere,
    drawCube,
    colors: { armorColorDark, armorColorLight, jointColor }
  });
}

function renderGrid(currentTimeSeconds) {
    pushMatrix();
        const slideSpeed = (currentAnim === "uprightSpin" || currentAnim === "sitSpin") ? 0.0 : 0.25; 
        const zOffset = -(currentTimeSeconds * 60 * slideSpeed) % 2.0; 
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, window.flatten(window.mult(modelViewMatrix, window.translate(0.0, 0.0, zOffset))));
        gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
        const gridColors = new Float32Array(geoOffsets.grid.count * 4);
        for(let i=0; i<geoOffsets.grid.count; i++) {
            gridColors[i*4] = gridColor[0]; gridColors[i*4+1] = gridColor[1];
            gridColors[i*4+2] = gridColor[2]; gridColors[i*4+3] = gridColor[3];
        }
        gl.bufferSubData(gl.ARRAY_BUFFER, geoOffsets.grid.offset * 16, gridColors);
        gl.drawArrays(gl.LINES, geoOffsets.grid.offset, geoOffsets.grid.count);
    popMatrix();
}

function renderArena(currentTimeSeconds) {
    const tileWidth = 60; 
    const slideSpeed = (currentAnim === "uprightSpin" || currentAnim === "sitSpin") ? 0.0 : 0.5;
    const scrollZ = -(currentTimeSeconds * 60 * slideSpeed) % tileWidth;

    for (let i = -1; i <= 2; i++) {
        const offsetZ = i * tileWidth + scrollZ;
        
        pushMatrix();
            modelViewMatrix = window.mult(modelViewMatrix, window.translate(0.0, 0.0, offsetZ));
            gl.uniformMatrix4fv(modelViewMatrixLoc, false, window.flatten(modelViewMatrix));
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
            const rinkColors = new Float32Array(geoOffsets.rink.count * 4);
            for(let j=0; j<geoOffsets.rink.count; j++) {
                rinkColors[j*4] = 0.9; rinkColors[j*4+1] = 0.95;
                rinkColors[j*4+2] = 1.0; rinkColors[j*4+3] = 1.0;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, geoOffsets.rink.offset * 16, rinkColors);
            gl.drawArrays(gl.TRIANGLES, geoOffsets.rink.offset, geoOffsets.rink.count);

            const wallColors = new Float32Array(geoOffsets.wall.count * 4);
            for(let j=0; j<geoOffsets.wall.count; j++) {
                const boardIdx = Math.floor(j / 12);
                let c = (boardIdx % 2 === 0) ? adColor1 : adColor2;
                wallColors[j*4] = c[0]; wallColors[j*4+1] = c[1];
                wallColors[j*4+2] = c[2]; wallColors[j*4+3] = c[3];
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, geoOffsets.wall.offset * 16, wallColors);
            gl.drawArrays(gl.TRIANGLES, geoOffsets.wall.offset, geoOffsets.wall.count);
            renderAudiences(currentTimeSeconds);
        popMatrix();
    }
}

function generateAudienceColors() {
    for (let i = 0; i < 100; i++) {
        colors.push(window.vec4(Math.random(), Math.random(), Math.random(), 1.0));
    }
}

function renderAudiences(currentTimeSeconds) {
    const wSize = 30;
    const ay = -5.85;
    const standHeight = ay + 6.8;
    const audState = {};
    for (let row = 0; row < 2; row++) {
        const xPos = -(wSize + 10 + (row * 5));
        for (let z = -wSize; z < wSize; z += 10) {
            const color = colors[Math.abs(z)%colors.length];
            const speed = (currentAnim === "uprightSpin" || currentAnim === "sitSpin") ? 0 : 6.0;
            const anim = ((Math.abs(z) * 3 + row) % 2) === 0 ? "clap" : "jump";
            let bounce = 0;
            if(anim == "jump") bounce = Math.abs(Math.sin(currentTimeSeconds * speed + (Math.abs(z)*3 + row * 7) % 5)) * 0.8;
            let lShoulder = 0.0; lElbow = 0.0; rShoulder = 0.0; rElbow = 0.0;
            if(anim == "clap") {
                lShoulder = Math.sin(currentTimeSeconds * speed + (Math.abs(z)*3 + row * 7)) * 60 + 30;
                rShoulder = Math.sin(currentTimeSeconds * speed + (Math.abs(z)*3 + row * 7) + Math.PI) * 60 + 30;
            }
            audState.xPos = xPos;
            audState.standHeight = standHeight;
            audState.bounce = bounce;
            audState.z = z;
            audState.lShoulder = lShoulder;
            audState.rShoulder = rShoulder;
            audState.lElbow = lElbow;
            audState.rElbow = rElbow;

            renderAudience(audState, {
                pushMatrix, popMatrix, applyTransform, drawCylinder, drawSphere, drawCube },
                color);
        }
    }
}
