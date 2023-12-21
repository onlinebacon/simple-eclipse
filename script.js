const { PI, sin, cos } = Math;
const TAU = PI*2;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const inputTime = document.querySelector('#time');
const inputAdjustment = document.querySelector('#adjustment');

let center_index = 0;

let kmToPx = 4e-6;
let true_sun_rad = 696340*kmToPx;
let true_earth_rad = 6371*kmToPx;
let true_moon_rad = 1737.4*kmToPx;
let true_earth_sun_dist = 150e6*kmToPx;
let true_earth_moon_dist = 384400*kmToPx;

let view_sun_rad = 50;
let view_earth_rad = 15;
let view_moon_rad = 5;
let view_earth_sun_dist = 300;
let view_earth_moon_dist = 100;

let sun_rad;
let earth_rad;
let moon_rad;
let earth_sun_dist;
let earth_moon_dist;

let t_days = 0;
let earth_rot = 1;
let earth_orbit = 365;
let moon_orbit = 28;
let sun_x = 0;
let sun_y = 0;
let scale = 1;

let cx, cy;
let earth_x;
let earth_y;
let moon_x;
let moon_y;
let adjustment = 0;

const adjustScale = (tVal, vVal, t) => {
    const logA = Math.log(tVal);
    const logB = Math.log(vVal);
    const log = logA + (logB - logA)*t;
    return Math.exp(log);
};

const update = () => {
    sun_rad = adjustScale(view_sun_rad, true_sun_rad, adjustment);
    earth_rad = adjustScale(view_earth_rad, true_earth_rad, adjustment);
    moon_rad = adjustScale(view_moon_rad, true_moon_rad, adjustment);
    earth_sun_dist = adjustScale(view_earth_sun_dist, true_earth_sun_dist, adjustment);
    earth_moon_dist = adjustScale(view_earth_moon_dist, true_earth_moon_dist, adjustment);

    earth_x = sun_x + earth_sun_dist*cos(t_days/earth_orbit*TAU);
    earth_y = sun_y - earth_sun_dist*sin(t_days/earth_orbit*TAU);

    moon_x = earth_x + earth_moon_dist*cos(t_days/moon_orbit*TAU);
    moon_y = earth_y - earth_moon_dist*sin(t_days/moon_orbit*TAU);
};

const drawShadowLine = () => {
    const dx = moon_x - sun_x;
    const dy = moon_y - sun_y;
    const len = Math.sqrt(dx**2 + dy**2);
    const d = earth_moon_dist + earth_sun_dist;
    const x = sun_x + dx/len*d;
    const y = sun_y + dy/len*d;
    ctx.strokeStyle = '#f00';
    ctx.beginPath();
    moveTo(sun_x, sun_y);
    lineTo(x, y);
    ctx.stroke();
};

const project = (x, y) => {
    return [
        canvas.width/2 + (x - cx)*scale,
        canvas.height/2 + (y - cy)*scale,
    ];
};

const moveTo = (x, y) => ctx.moveTo(...project(x, y));
const lineTo = (x, y) => ctx.lineTo(...project(x, y));
const circle = (x, y, rad, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(...project(x, y), rad*scale, 0, TAU);
    ctx.fill();
};

const drawEarthLine = () => {
    let ax = earth_x + earth_rad*sin(t_days/earth_rot*TAU);
    let ay = earth_y + earth_rad*cos(t_days/earth_rot*TAU);
    let bx = earth_x - earth_rad*sin(t_days/earth_rot*TAU);
    let by = earth_y - earth_rad*cos(t_days/earth_rot*TAU);

    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    moveTo(ax, ay);
    lineTo(bx, by);
    ctx.stroke();
};

const render = () => {
    t_days = inputTime.value*moon_orbit;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    update();

    if (center_index === 0) {
        cx = sun_x;
        cy = sun_y;
    } else if (center_index === 1) {
        cx = earth_x;
        cy = earth_y;
    } else if (center_index === 2) {
        cx = moon_x;
        cy = moon_y;
    }
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    circle(sun_x, sun_y, sun_rad, '#fc0');
    circle(earth_x, earth_y, earth_rad, '#07f');
    circle(moon_x, moon_y, moon_rad, '#777');
    drawShadowLine();
    drawEarthLine();
};

document.querySelectorAll('input').forEach(e => e.addEventListener('input', () => {
    render();
}));

render();

window.addEventListener('wheel', e => {
    scale *= (1 - e.deltaY/1000);
    render();
});

inputAdjustment.addEventListener('input', () => {
    adjustment = inputAdjustment.value*1;
});

window.addEventListener('resize', render);
window.addEventListener('keydown', e => {
    if (e.code === 'Enter') {
        center_index ++;
        center_index %= 3;
    }
    render();
});
