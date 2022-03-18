const
    EG_VIN = 'JTDZN3EU0E3298500',
    colors = document.querySelector('.colors'),
    carContainer = document.querySelector('.car-container');
let carsLoaded = {}, currentChassis = document.querySelector('#chassis');

const COLORS_NAME = ['369369369499', '477477479499', '370449485499', '436475499499', '403424397499', '409387419499', '494389399499', '490433397499', '540499411499', '389374374499'];

window.onload = () => setTimeout(() => {
    colors.innerHTML = COLORS_NAME.map(color => `<div><img data-color="${ color }" src="./img/colors/${ color }.png" alt=""></div>`).join``;
    carsLoaded = COLORS_NAME.reduce((acc, color) => {
        const img = document.createElement('img');
        img.src = `./img/chassis/${ color }.png`;
        img.setAttribute('data-color', color);
        acc[color] = img;
        return acc;
    }, {});
    carContainer.classList.remove('loading');
}, 1000);

colors.addEventListener('click', e => {
    const selected = e.target;
    const newColor = selected.getAttribute('data-color');
    const currentColor = currentChassis.getAttribute('data-color');

    if(!newColor || currentColor === newColor) return;

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
