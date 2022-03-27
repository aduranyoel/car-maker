const
    colors = document.querySelector('.colors'),
    rims = document.querySelector('.rims'),
    carContainer = document.querySelector('.car-container'),
    drag = document.querySelector('.drag'),
    tiresElement = document.querySelector('#tires'),
    skinElement = document.querySelector('#skin'),

    COLORS_NAME = [
        '477477479499', '369369369499',
        '370449485499', '436475499499',
        '403424397499', '409387419499',
        '494389399499', '490433397499',
        '540499411499', '389374374499'],

    RIMS_TYPE = [
        'ASTBLDIA5', 'ASTGB5',
        'ASTSIL5LO', 'ENIGBLD',
        'ENIGMBD', 'ENIGSS',
    ],

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

let colorsLoaded = {},
    rimsLoaded = {},
    tires = [],
    skin = [],
    wheelLeft = [],
    wheelRight = [],
    chassis = [],
    chassisElement = document.querySelector('#chassis'),
    wheelLeftElement = document.querySelector('#wheel-left'),
    wheelRightElement = document.querySelector('#wheel-right'),
    isGrabbing = false, position = 1, grabBegin = 0, lastRange = 0, lastClientX = 0, currentRims;

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
        loadAvailableRims(),
        loadResource(getPictures.bind(this, 'tires')).then(res => tires = res),
        loadResource(getPictures.bind(this, 'chassis/skin')).then(res => skin = res),
        loadWheels('ASTBLDIA5'),
        loadChassisColors(COLORS_NAME[0]).then(() =>  colorsLoaded[COLORS_NAME[0]] = chassis),
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

async function loadAvailableRims() {
    try {
        const blobs = await Promise.all(RIMS_TYPE.map(type => fetch(`./img/rims/${ type }.webp`).then(r => ({
            blob: r.blob(),
            type
        }))));
        for (const { blob, type } of blobs) {
            const div = document.createElement('div');
            const img = document.createElement('img');
            img.src = URL.createObjectURL(await blob);
            img.setAttribute('data-type', type);
            div.appendChild(img);
            rims.appendChild(div);
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
        chassis = result.map(img => {
            img.setAttribute('data-color', color);
            return img;
        })
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadWheels(type) {
    try {
        const [left, right] = await Promise.all([
            loadResource(getPictures.bind(this, `wheels/${ type }/left`)),
            loadResource(getPictures.bind(this, `wheels/${ type }/right`))
        ]);
        wheelLeft = left.map((img, i) => {
            const pos = mockWheelLeftPositions[i];
            img.classList.add('wheels');
            return new Wheel(pos.top, pos.left, img);
        })
        wheelRight = right.map((img, i) => {
            const pos = mockWheelRightPositions[i];
            img.classList.add('wheels');
            return new Wheel(pos.top, pos.left, img);
        })
        currentRims = type;
        rimsLoaded[type] = {
            left: [...wheelLeft],
            right: [...wheelRight],
        }
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

function loaderStart() {
    document.body.classList.add('loading');
    document.querySelector('.loader').style.opacity = '1';
    document.querySelector('.lds-ripple').style.display = '';
}

function loaderEnd() {
    document.querySelector('.loader').style.opacity = '0';
    document.querySelector('.lds-ripple').style.display = 'none';
    setTimeout(() => document.body.classList.remove('loading'), 1000);
}

function pageReady() {
    setCarPosition(position);
    loaderEnd();
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

const absFloor = num => Math.abs(~~num);

function animation3d({ clientX }) {
    if (!isGrabbing || typeof clientX !== 'number') return;

    const step = drag.getBoundingClientRect().width / 16;
    const toRight = clientX > lastClientX;
    lastClientX = clientX;
    const diff = absFloor(grabBegin - clientX);
    const range = absFloor(diff / step);

    if (lastRange === range) return;

    const diffRange = Math.abs(range - lastRange);
    position = ((toRight ? position + diffRange : position - diffRange) + 16) % 16;
    lastRange = range;
    setCarPosition(position);
}

drag.addEventListener('mousedown', grabStart);
document.addEventListener('mouseup', grabEnd);
document.addEventListener('mousemove', animation3d);
drag.addEventListener('dragstart', e => e.preventDefault());

drag.addEventListener('touchstart', e => grabStart({ clientX: e.touches.item(0).clientX }));
document.addEventListener('touchend', grabEnd);
document.addEventListener('touchmove', e => animation3d({ clientX: e.touches.item(0).clientX }));

colors.addEventListener('click', async(e) => {
    const selected = e.target;
    const newColor = selected.getAttribute('data-color');
    const currentColor = chassisElement.getAttribute('data-color');

    if (!newColor || currentColor === newColor) return;

    if(colorsLoaded[newColor]) {
        chassis = colorsLoaded[newColor];
    } else {
        await loadChassisColors(newColor);
        colorsLoaded[newColor] = chassis;
    }

    const clone = chassisElement.cloneNode(true);
    carContainer.removeChild(chassisElement);
    chassisElement = chassis[position].cloneNode(true);
    carContainer.appendChild(chassisElement);
    carContainer.appendChild(clone);

    setTimeout(() => clone.style.opacity = '0')
    setTimeout(() => carContainer.removeChild(clone), 1000);
})

rims.addEventListener('click', async (e) => {
    const newRims = e.target.getAttribute('data-type');

    if (!newRims || currentRims === newRims) return;

    const loaded = rimsLoaded[newRims];
    if (loaded) {
        wheelLeft = loaded.left;
        wheelRight = loaded.right;
        currentRims = newRims;
    } else {
        await loadWheels(newRims);
    }

    const wheelLeftClone = wheelLeftElement.cloneNode(true);
    const wheelRightClone = wheelRightElement.cloneNode(true);
    carContainer.removeChild(wheelLeftElement);
    carContainer.removeChild(wheelRightElement);
    wheelLeftElement = wheelLeft[position].item.cloneNode(true);
    wheelRightElement = wheelRight[position].item.cloneNode(true);
    wheelLeftElement.style.left = wheelLeft[position].left + 'px';
    wheelRightElement.style.left = wheelRight[position].left + 'px';
    wheelLeftElement.style.top = wheelLeft[position].top + 'px';
    wheelRightElement.style.top = wheelRight[position].top + 'px';
    carContainer.appendChild(wheelLeftElement);
    carContainer.appendChild(wheelRightElement);
    carContainer.appendChild(wheelLeftClone);
    carContainer.appendChild(wheelRightClone);

    setTimeout(() => {
        wheelLeftClone.style.opacity = '0'
        wheelRightClone.style.opacity = '0'
    })
    setTimeout(() => {
        carContainer.removeChild(wheelLeftClone)
        carContainer.removeChild(wheelRightClone)
    }, 1000);
})

// extra
const EG_VIN = 'JTDZN3EU0E3298500';
const restClient = (url, params) => fetch(`/api/${ url }?${ new URLSearchParams(params) }`).then(res => res.json());
const getSpecs = (vin) => restClient('specs', { vin });
const getImages = ({ make, model, color, trim, year }) => restClient('images', { make, model, color, trim, year });
