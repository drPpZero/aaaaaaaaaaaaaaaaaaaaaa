import { renderCharacter } from "./character.js";
import { getUpdatedRenderState } from "./animation.js";

let gl;
let program;
let modelViewMatrixLoc;

let points = [];
let vPositionBuffer, vColorBuffer;

let cubeOffset = 0, numCubeVertices = 0;
let cylinderOffset = 0, numCylinderVertices = 0;
let sphereOffset = 0, numSphereVertices = 0;
let gridOffset = 0, numGridVertices = 0;

// Arena Geometry Offsets
let rinkOffset = 0, numRinkVertices = 0;
let wallOffset = 0, numWallVertices = 0;

let jointColor, armorColorDark, armorColorLight, bladeColor, gridColor;
let iceColor, iceMarkColor, wallBaseColor, adColor1, adColor2;

let modelViewMatrix;
const matrixStack = [];

// --- Rendered State (The actual values sent to shaders) ---
let renderState = {};
let currentAnim = "sideStep";

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

function drawCube(sx, sy, sz, color) { drawShape(cubeOffset, numCubeVertices, sx, sy, sz, color); }
function drawCylinder(sx, sy, sz, color) { drawShape(cylinderOffset, numCylinderVertices, sx, sy, sz, color); }
function drawSphere(sx, sy, sz, color) { drawShape(sphereOffset, numSphereVertices, sx, sy, sz, color); }

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
  cubeOffset = 0; numCubeVertices = 0;
  cylinderOffset = 0; numCylinderVertices = 0;
  sphereOffset = 0; numSphereVertices = 0;
  gridOffset = 0; numGridVertices = 0;
  rinkOffset = 0; numRinkVertices = 0;
  wallOffset = 0; numWallVertices = 0;

  generateCube(); 
  generateCylinder(); 
  generateSphere(); 
  generateGrid();  
  generateArena();

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

  const eye = window.vec3(15.588, 3.0, 9.0); 
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
        const gridColors = new Float32Array(numGridVertices * 4);
        for(let i=0; i<numGridVertices; i++) {
            gridColors[i*4] = gridColor[0]; gridColors[i*4+1] = gridColor[1];
            gridColors[i*4+2] = gridColor[2]; gridColors[i*4+3] = gridColor[3];
        }
        gl.bufferSubData(gl.ARRAY_BUFFER, gridOffset * 16, gridColors);
        gl.drawArrays(gl.LINES, gridOffset, numGridVertices);
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
            
            // Force SOLID light blue ice
            const rinkColors = new Float32Array(numRinkVertices * 4);
            for(let j=0; j<numRinkVertices; j++) {
                rinkColors[j*4] = 0.9; rinkColors[j*4+1] = 0.95;
                rinkColors[j*4+2] = 1.0; rinkColors[j*4+3] = 1.0;
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, rinkOffset * 16, rinkColors);
            gl.drawArrays(gl.TRIANGLES, rinkOffset, numRinkVertices);

            // Force distinct horizontal rectangular advertisement boards
            const wallColors = new Float32Array(numWallVertices * 4);
            for(let j=0; j<numWallVertices; j++) {
                const boardIdx = Math.floor(j / 12);
                let c = (boardIdx % 2 === 0) ? adColor1 : adColor2;
                wallColors[j*4] = c[0]; wallColors[j*4+1] = c[1];
                wallColors[j*4+2] = c[2]; wallColors[j*4+3] = c[3];
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, wallOffset * 16, wallColors);
            gl.drawArrays(gl.TRIANGLES, wallOffset, numWallVertices);
        popMatrix();
    }
}

function generateCube() {
    cubeOffset = points.length;
    const vertices = [
        window.vec4(-0.5,-0.5,0.5,1.0), window.vec4(-0.5,0.5,0.5,1.0), window.vec4(0.5,0.5,0.5,1.0), window.vec4(0.5,-0.5,0.5,1.0),
        window.vec4(-0.5,-0.5,-0.5,1.0), window.vec4(-0.5,0.5,-0.5,1.0), window.vec4(0.5,0.5,-0.5,1.0), window.vec4(0.5,-0.5,-0.5,1.0)
    ];
    const faceIndices = [ [1,0,3,2], [2,3,7,6], [3,0,4,7], [6,5,1,2], [4,5,6,7], [5,4,0,1] ];
    for (let i = 0; i < faceIndices.length; i++) {
        const a = faceIndices[i][0], b = faceIndices[i][1], c = faceIndices[i][2], d = faceIndices[i][3];
        points.push(vertices[a], vertices[b], vertices[c], vertices[a], vertices[c], vertices[d]);
        numCubeVertices += 6;
    }
}

function generateCylinder() {
    cylinderOffset = points.length;
    const slices = 16, r = 0.5, h = 0.5; 
    for(let i=0; i<slices; i++) {
        const t1 = i * 2 * Math.PI / slices, t2 = (i+1) * 2 * Math.PI / slices;
        points.push(window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t1), -h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0));
        points.push(window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0), window.vec4(r*Math.cos(t2), h, r*Math.sin(t2), 1.0));
        numCylinderVertices += 6;
        points.push(window.vec4(0, h, 0, 1.0), window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), h, r*Math.sin(t2), 1.0));
        points.push(window.vec4(0, -h, 0, 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0), window.vec4(r*Math.cos(t1), -h, r*Math.sin(t1), 1.0));
        numCylinderVertices += 6;
    }
}

function generateSphere() {
    sphereOffset = points.length;
    const latBands = 12, lonBands = 12, r = 0.5;
    for (let lat = 0; lat < latBands; lat++) {
        const theta1 = lat * Math.PI / latBands, theta2 = (lat + 1) * Math.PI / latBands;
        for (let lon = 0; lon < lonBands; lon++) {
            const phi1 = lon * 2 * Math.PI / lonBands, phi2 = (lon + 1) * 2 * Math.PI / lonBands;
            points.push(
                window.vec4(r*Math.sin(theta1)*Math.cos(phi1), r*Math.cos(theta1), r*Math.sin(theta1)*Math.sin(phi1), 1.0),
                window.vec4(r*Math.sin(theta2)*Math.cos(phi1), r*Math.cos(theta2), r*Math.sin(theta2)*Math.sin(phi1), 1.0),
                window.vec4(r*Math.sin(theta2)*Math.cos(phi2), r*Math.cos(theta2), r*Math.sin(theta2)*Math.sin(phi2), 1.0),
                window.vec4(r*Math.sin(theta1)*Math.cos(phi1), r*Math.cos(theta1), r*Math.sin(theta1)*Math.sin(phi1), 1.0),
                window.vec4(r*Math.sin(theta2)*Math.cos(phi2), r*Math.cos(theta2), r*Math.sin(theta2)*Math.sin(phi2), 1.0),
                window.vec4(r*Math.sin(theta1)*Math.cos(phi2), r*Math.cos(theta1), r*Math.sin(theta1)*Math.sin(phi2), 1.0)
            );
            numSphereVertices += 6;
        }
    }
}

function generateGrid() {
    gridOffset = points.length;
    const size = 100, step = 2.0, y = -5.8;      
    for (let i = -size; i <= size; i += step) {
        points.push(window.vec4(i, y, -size, 1.0), window.vec4(i, y, size, 1.0));
        points.push(window.vec4(-size, y, i, 1.0), window.vec4(size, y, i, 1.0));
        numGridVertices += 4;
    }
}

function generateArena() {
    rinkOffset = points.length;
    const size = 30, y = -5.85; 
    points.push(window.vec4(-size, y, -size, 1.0), window.vec4(-size, y, size, 1.0), window.vec4(size, y, size, 1.0));
    points.push(window.vec4(-size, y, -size, 1.0), window.vec4(size, y, size, 1.0), window.vec4(size, y, -size, 1.0));
    numRinkVertices += 6;

    wallOffset = points.length;
    // Horizontal rectangular ad boards (20x4 units)
    const h = 4.0, w = 20.0, wSize = 30;
    for (let z = -wSize; z < wSize; z += w) {
        // Left
        points.push(window.vec4(-wSize, y+2, z, 1.0), window.vec4(-wSize, y+6, z, 1.0), window.vec4(-wSize, y+6, z+w, 1.0));
        points.push(window.vec4(-wSize, y+2, z, 1.0), window.vec4(-wSize, y+6, z+w, 1.0), window.vec4(-wSize, y+2, z+w, 1.0));
        numWallVertices += 6;
        // Right
        points.push(window.vec4(wSize, y+2, z, 1.0), window.vec4(wSize, y+6, z+w, 1.0), window.vec4(wSize, y+6, z, 1.0));
        points.push(window.vec4(wSize, y+2, z, 1.0), window.vec4(wSize, y+2, z+w, 1.0), window.vec4(wSize, y+6, z+w, 1.0));
        numWallVertices += 6;
    }
}
