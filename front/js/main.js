const
    colors = document.querySelector('.colors'),
    carContainer = document.querySelector('.car-container'),
    drag = document.querySelector('.drag'),
    tiresElement = document.querySelector('#tires'),
    skinElement = document.querySelector('#skin'),
    wheelLeftElement = document.querySelector('#wheel-left'),
    wheelRightElement = document.querySelector('#wheel-right'),
    chassisElement = document.querySelector('#chassis'),

    COLORS_NAME = [
        '477477479499', '369369369499',
        '370449485499', '436475499499',
        '403424397499', '409387419499',
        '494389399499', '490433397499',
        '540499411499', '389374374499'],

    mockWheelLeftPositions = [
        { top: 187, left: 231 },
        { top: 193, left: 172 },
        { top: 202, left: 135 },
        { top: 205, left: 142 },
        { top: 210, left: 195 },
        { top: 218, left: 302 },
        { top: 218, left: 436 },
        { top: 0, left: 0 }, // empty
        { top: 187, left: 228 },
        { top: 193, left: 169 },
        { top: 199, left: 132 },
        { top: 206, left: 134 },
        { top: 213, left: 185 },
        { top: 217, left: 294 },
        { top: 219, left: 433 },
        { top: 0, left: 0 }, // empty
    ],
    mockWheelRightPositions = [
        { top: 218, left: 329 },
        { top: 218, left: 421 },
        { top: 207, left: 538 },
        { top: 205, left: 565 },
        { top: 200, left: 595 },
        { top: 192, left: 588 },
        { top: 187, left: 556 },
        { top: 0, left: 0 }, // empty
        { top: 219, left: 327 },
        { top: 218, left: 415 },
        { top: 211, left: 501 },
        { top: 206, left: 560 },
        { top: 198, left: 589 },
        { top: 192, left: 584 },
        { top: 188, left: 555 },
        { top: 0, left: 0 }, // empty
    ];

let
    tires = [],
    skin = [],
    wheelLeft = [],
    wheelRight = [],
    chassis = [],
    currentChassis = document.querySelector('#chassis'),
    isGrabbing = false, position = 1, grabBegin = 0, lastRange = 0, lastClientX = 0;

class Wheel {
    constructor(top = 0, left = 0, item = null) {
        this.top = top;
        this.left = left;
        this.item = item;
    }
}

window.onload = () => {
    Promise.all([
        loadAvailableColors(),
        loadResource(getPictures.bind(this, 'tires')).then(res => tires = res),
        loadResource(getPictures.bind(this, 'chassis/skin')).then(res => skin = res),
        loadWheels(),
        loadChassisColors(COLORS_NAME[0]).then(res => chassis = res),
    ]).then(pageReady).catch(console.error);
}

async function loadAvailableColors() {
    try {
        const blobs = await Promise.all(COLORS_NAME.map(color => fetch(`./img/colors/${ color }.png`).then(r => ({
            blob: r.blob(),
            color
        }))));
        for (const { blob, color } of blobs) {
            const div = document.createElement('div');
            const img = document.createElement('img');
            img.src = URL.createObjectURL(await blob);
            img.setAttribute('data-color', color);
            div.appendChild(img);
            colors.appendChild(div);
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

function getPictures(url) {
    return Promise.all(
        Array(16)
            .fill('')
            .map((_, i) => fetch(`./img/${ url }/${ `${ i + 1 }`.padStart(2, '0') }.png`).then(r => ({ blob: r.blob() })))
    );
}

async function loadChassisColors(color) {
    try {
        const result = await loadResource(getPictures.bind(this, `chassis/${ color }`))
        return result.map(img => {
            img.setAttribute('data-color', color);
            return img;
        })
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadWheels() {
    try {
        const [left, right] = await Promise.all([
            loadResource(getPictures.bind(this, 'wheels/left')),
            loadResource(getPictures.bind(this, 'wheels/right'))
        ]);
        wheelLeft = left.map((img, i) => {
            const pos = mockWheelLeftPositions[i];
            return new Wheel(pos.top, pos.left, img);
        })
        wheelRight = right.map((img, i) => {
            const pos = mockWheelRightPositions[i];
            return new Wheel(pos.top, pos.left, img);
        })
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadResource(fetcher) {
    try {
        const result = [];
        const blobs = await fetcher();
        for (const { blob } of blobs) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(await blob);
            result.push(img);
        }
        return result;
    } catch (e) {
        return Promise.reject(e);
    }
}

function setCarPosition(position) {
    tiresElement.src = tires[position].src
    skinElement.src = skin[position].src
    wheelLeftElement.src = wheelLeft[position].item.src
    wheelLeftElement.style.top = wheelLeft[position].top + 'px'
    wheelLeftElement.style.left = wheelLeft[position].left + 'px'
    wheelRightElement.src = wheelRight[position].item.src
    wheelRightElement.style.top = wheelRight[position].top + 'px'
    wheelRightElement.style.left = wheelRight[position].left + 'px'
    chassisElement.src = chassis[position].src
}

function pageReady() {
    setCarPosition(position);
    document.querySelector('.loader').style.opacity = '0';
    document.querySelector('.lds-ripple').style.display = 'none';
    setTimeout(() => document.body.classList.remove('loading'), 1000);
}

function grabStart({ clientX }) {
    isGrabbing = true;
    grabBegin = clientX;
}

function grabEnd() {
    isGrabbing = false;
    grabBegin = 0;
    lastRange = 0;
}

const absFloor = num => Math.abs(Math.floor(num));

drag.addEventListener('mousedown', grabStart);
document.addEventListener('mouseup', grabEnd);
drag.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('mousemove', ({ clientX }) => {
    if (!isGrabbing) return;

    const step = drag.getBoundingClientRect().width / 16;
    const toRight = clientX > lastClientX;
    lastClientX = clientX;
    const diff = absFloor(grabBegin - clientX);
    const range = absFloor(diff / step);

    if (lastRange === range) return;

    const diffRange = lastRange < range ? range - lastRange : lastRange - range;
    position = ((toRight ? position + diffRange : position - diffRange) + 16) % 16;
    lastRange = range;
    setCarPosition(position);
})

colors.addEventListener('click', e => {
    const selected = e.target;
    const newColor = selected.getAttribute('data-color');
    const currentColor = currentChassis.getAttribute('data-color');

    if (!newColor || currentColor === newColor) return;

    const clone = currentChassis.cloneNode(true);
    carContainer.removeChild(currentChassis);
    currentChassis = carsLoaded[newColor];
    carContainer.appendChild(currentChassis);
    carContainer.appendChild(clone);

    setTimeout(() => clone.style.opacity = '0')
    setTimeout(() => carContainer.removeChild(clone), 1000);
})

// extra
const EG_VIN = 'JTDZN3EU0E3298500';
const restClient = (url, params) => fetch(`/api/${ url }?${ new URLSearchParams(params) }`).then(res => res.json());
const getSpecs = (vin) => restClient('specs', { vin });
const getImages = ({ make, model, color, trim, year }) => restClient('images', { make, model, color, trim, year });
