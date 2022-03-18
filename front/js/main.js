const
    EG_VIN = 'JTDZN3EU0E3298500',
    colors = document.querySelector('.colors'),
    chassis = document.querySelector('#chassis'),
    carContainer = document.querySelector('.car-container');

const COLORS_NAME = ['369369369499', '477477479499', '370449485499', '436475499499', '403424397499', '409387419499', '494389399499', '490433397499', '540499411499', '389374374499'];

window.onload = () => {
    colors.innerHTML = COLORS_NAME.map(color => `<div><img data-color="${ color }" src="./img/colors/${ color }.png" alt=""></div>`).join``;
}

colors.addEventListener('click', e => {
    const clone = chassis.cloneNode(true);
    carContainer.append(clone);

    const newColor = e.target.getAttribute('data-color');
    chassis.src = `./img/chassis/${ newColor }.png`;

    setTimeout(() => clone.style.opacity = '0')
    setTimeout(() => carContainer.removeChild(clone), 1000);
})


const restClient = (url, params) => fetch(`/api/${ url }?${ new URLSearchParams(params) }`).then(res => res.json());
const getSpecs = (vin) => restClient('specs', { vin });
const getImages = ({ make, model, color, trim, year }) => restClient('images', { make, model, color, trim, year });
