const
    EG_VIN = 'JTDZN3EU0E3298500',
    colors = document.querySelector('.colors'),
    carContainer = document.querySelector('.car-container');
let carsLoaded = {}, currentChassis = document.querySelector('#chassis');

const COLORS_NAME = ['477477479499', '369369369499', '370449485499', '436475499499', '403424397499', '409387419499', '494389399499', '490433397499', '540499411499', '389374374499'];

window.onload = () => {
    Promise.all([
        loadAvailableColors(),
        loadChassisColors().then(() => currentChassis.src = carsLoaded[COLORS_NAME[0]].src)]
    ).then(pageReady);
}

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


const restClient = (url, params) => fetch(`/api/${ url }?${ new URLSearchParams(params) }`).then(res => res.json());
const getSpecs = (vin) => restClient('specs', { vin });
const getImages = ({ make, model, color, trim, year }) => restClient('images', { make, model, color, trim, year });

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
        return Promise.reject();
    }
}

async function loadChassisColors() {
    try {
        const blobs = await Promise.all(COLORS_NAME.map(color => fetch(`./img/chassis/${ color }.png`).then(r => ({
            blob: r.blob(),
            color
        }))));
        for (const { blob, color } of blobs) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(await blob);
            img.setAttribute('data-color', color);
            carsLoaded[color] = img;
        }
    } catch (e) {
        return Promise.reject();
    }
}

function pageReady() {
    document.querySelector('.loader').style.opacity = '0';
    document.querySelector('.lds-ripple').style.display = 'none';
    setTimeout(() => document.body.classList.remove('loading'), 1000);
}
