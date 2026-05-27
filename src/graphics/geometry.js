export function buildGeometry() {
    const points = [];
    const offsets = {
        cube: { offset: 0, count: 0 },
        cylinder: { offset: 0, count: 0 },
        sphere: { offset: 0, count: 0 },
        grid: { offset: 0, count: 0 },
        rink: { offset: 0, count: 0 },
        wall: { offset: 0, count: 0 }
    };

    //Cube
    offsets.cube.offset = points.length;
    const cubeVertices = [
        window.vec4(-0.5,-0.5,0.5,1.0), window.vec4(-0.5,0.5,0.5,1.0), window.vec4(0.5,0.5,0.5,1.0), window.vec4(0.5,-0.5,0.5,1.0),
        window.vec4(-0.5,-0.5,-0.5,1.0), window.vec4(-0.5,0.5,-0.5,1.0), window.vec4(0.5,0.5,-0.5,1.0), window.vec4(0.5,-0.5,-0.5,1.0)
    ];
    const faceIndices = [ [1,0,3,2], [2,3,7,6], [3,0,4,7], [6,5,1,2], [4,5,6,7], [5,4,0,1] ];
    for (let i = 0; i < faceIndices.length; i++) {
        const a = faceIndices[i][0], b = faceIndices[i][1], c = faceIndices[i][2], d = faceIndices[i][3];
        points.push(cubeVertices[a], cubeVertices[b], cubeVertices[c], cubeVertices[a], cubeVertices[c], cubeVertices[d]);
        offsets.cube.count += 6;
    }

    //Cylinder
    offsets.cylinder.offset = points.length;
    const slices = 16, r = 0.5, h = 0.5; 
    for(let i=0; i<slices; i++) {
        const t1 = i * 2 * Math.PI / slices, t2 = (i+1) * 2 * Math.PI / slices;
        points.push(window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t1), -h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0));
        points.push(window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0), window.vec4(r*Math.cos(t2), h, r*Math.sin(t2), 1.0));
        offsets.cylinder.count += 6;
        points.push(window.vec4(0, h, 0, 1.0), window.vec4(r*Math.cos(t1), h, r*Math.sin(t1), 1.0), window.vec4(r*Math.cos(t2), h, r*Math.sin(t2), 1.0));
        points.push(window.vec4(0, -h, 0, 1.0), window.vec4(r*Math.cos(t2), -h, r*Math.sin(t2), 1.0), window.vec4(r*Math.cos(t1), -h, r*Math.sin(t1), 1.0));
        offsets.cylinder.count += 6;
    }

    //Sphere
    offsets.sphere.offset = points.length;
    const latBands = 12, lonBands = 12, sr = 0.5;
    for (let lat = 0; lat < latBands; lat++) {
        const theta1 = lat * Math.PI / latBands, theta2 = (lat + 1) * Math.PI / latBands;
        for (let lon = 0; lon < lonBands; lon++) {
            const phi1 = lon * 2 * Math.PI / lonBands, phi2 = (lon + 1) * 2 * Math.PI / lonBands;
            points.push(
                window.vec4(sr*Math.sin(theta1)*Math.cos(phi1), sr*Math.cos(theta1), sr*Math.sin(theta1)*Math.sin(phi1), 1.0),
                window.vec4(sr*Math.sin(theta2)*Math.cos(phi1), sr*Math.cos(theta2), sr*Math.sin(theta2)*Math.sin(phi1), 1.0),
                window.vec4(sr*Math.sin(theta2)*Math.cos(phi2), sr*Math.cos(theta2), sr*Math.sin(theta2)*Math.sin(phi2), 1.0),
                window.vec4(sr*Math.sin(theta1)*Math.cos(phi1), sr*Math.cos(theta1), sr*Math.sin(theta1)*Math.sin(phi1), 1.0),
                window.vec4(sr*Math.sin(theta2)*Math.cos(phi2), sr*Math.cos(theta2), sr*Math.sin(theta2)*Math.sin(phi2), 1.0),
                window.vec4(sr*Math.sin(theta1)*Math.cos(phi2), sr*Math.cos(theta1), sr*Math.sin(theta1)*Math.sin(phi2), 1.0)
            );
            offsets.sphere.count += 6;
        }
    }

    //Grid
    offsets.grid.offset = points.length;
    const gSize = 100, step = 2.0, gy = -5.8;      
    for (let i = -gSize; i <= gSize; i += step) {
        points.push(window.vec4(i, gy, -gSize, 1.0), window.vec4(i, gy, gSize, 1.0));
        points.push(window.vec4(-gSize, gy, i, 1.0), window.vec4(gSize, gy, i, 1.0));
        offsets.grid.count += 4;
    }

    //Arena
    offsets.rink.offset = points.length;
    const aSize = 30, ay = -5.85; 
    points.push(window.vec4(-aSize, ay, -aSize, 1.0), window.vec4(-aSize, ay, aSize, 1.0), window.vec4(aSize, ay, aSize, 1.0));
    points.push(window.vec4(-aSize, ay, -aSize, 1.0), window.vec4(aSize, ay, aSize, 1.0), window.vec4(aSize, ay, -aSize, 1.0));
    offsets.rink.count += 6;

    offsets.wall.offset = points.length;
    const wh = 4.0, ww = 20.0, wSize = 30;
    for (let z = -wSize; z < wSize; z += ww) {
        points.push(window.vec4(-wSize, ay, z, 1.0), window.vec4(-wSize, ay+6, z, 1.0), window.vec4(-wSize, ay+6, z+ww, 1.0));
        points.push(window.vec4(-wSize, ay, z, 1.0), window.vec4(-wSize, ay+6, z+ww, 1.0), window.vec4(-wSize, ay, z+ww, 1.0));
        offsets.wall.count += 6;
        points.push(window.vec4(wSize, ay, z, 1.0), window.vec4(wSize, ay+6, z+ww, 1.0), window.vec4(wSize, ay+6, z, 1.0));
        points.push(window.vec4(wSize, ay, z, 1.0), window.vec4(wSize, ay, z+ww, 1.0), window.vec4(wSize, ay+6, z+ww, 1.0));
        offsets.wall.count += 6;
    }

    return { points, offsets };
}